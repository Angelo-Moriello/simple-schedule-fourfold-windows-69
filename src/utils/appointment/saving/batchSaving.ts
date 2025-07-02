
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { saveAppointmentWithRetry } from './retryMechanism';
import { getMobileDelays } from './mobileDetection';

export const saveAppointmentsBatch = async (
  appointments: Appointment[],
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[],
  batchType: 'additional' | 'recurring'
): Promise<{ savedCount: number; failedSaves: string[] }> => {
  const delays = getMobileDelays();
  const failedSaves: string[] = [];
  let savedCount = 0;

  if (appointments.length === 0) {
    console.log(`📋 BATCH ${batchType} - Nessun appuntamento da salvare`);
    return { savedCount: 0, failedSaves: [] };
  }

  const batchDelay = batchType === 'recurring' ? delays.recurringDelay : delays.additionalDelay;
  
  console.log(`🚀 INIZIO BATCH ${batchType.toUpperCase()} - DELAY MASSIMI PER MOBILE V4:`, {
    appointmentsCount: appointments.length,
    batchDelay: `${batchDelay}ms`,
    batchType: batchType === 'recurring' ? '🔴 RICORRENTI (CRITICI)' : '🟡 AGGIUNTIVI (IMPORTANTI)',
    saveDelay: `${delays.saveDelay}ms`,
    isMobile: delays.isMobile,
    modalità: delays.isMobile ? '📱 MOBILE (DELAY MASSIMI V4)' : '💻 DESKTOP (DELAY NORMALI)',
    tempoTotaleStimato: `${Math.ceil((appointments.length * batchDelay) / 1000)}s`,
    confrontoDelay: {
      desktop: batchType === 'recurring' ? '1000ms' : '800ms',
      mobile: batchType === 'recurring' ? '15000ms' : '12000ms',
      attuale: `${batchDelay}ms`,
      differenza: delays.isMobile ? '+1400-1800% rispetto desktop' : 'standard'
    },
    dettagliAppuntamenti: appointments.map((app, i) => ({
      index: i + 1,
      client: app.client,
      date: app.date,
      time: app.time,
      service: app.serviceType,
      id: app.id,
      employeeId: app.employeeId
    })),
    timestamp: new Date().toISOString()
  });

  // Progress toast per batch grandi con info mobile dettagliate
  let progressToastId: string | number | undefined;
  if (appointments.length > 1) {
    const tempoStimato = Math.ceil((appointments.length * batchDelay) / 1000);
    const mobileWarning = delays.isMobile ? 
      ` (mobile: circa ${tempoStimato}s richiesti - DELAY MASSIMI)` : '';
    console.log(`📱 Progress toast per ${appointments.length} appuntamenti${mobileWarning}`);
    progressToastId = toast.loading(`Salvando ${appointments.length} appuntamenti ${batchType}${mobileWarning}...`);
  }

  // SALVATAGGIO SEQUENZIALE CON DELAY MOBILE MASSIMI
  for (let i = 0; i < appointments.length; i++) {
    const appointment = appointments[i];
    
    console.log(`📝 [${i + 1}/${appointments.length}] PROCESSANDO ${batchType.toUpperCase()}: ${appointment.client} - ${appointment.date} ${appointment.time}`, {
      appuntamento: {
        id: appointment.id,
        client: appointment.client,
        date: appointment.date,
        time: appointment.time,
        employeeId: appointment.employeeId,
        serviceType: appointment.serviceType,
        duration: appointment.duration
      },
      progressInfo: {
        currentIndex: i + 1,
        totalAppointments: appointments.length,
        batchType,
        remainingTime: `${Math.ceil(((appointments.length - i - 1) * batchDelay) / 1000)}s`,
        isMobile: delays.isMobile
      },
      timestamp: new Date().toISOString()
    });
    
    try {
      console.log(`🔄 [${i + 1}/${appointments.length}] INIZIO SALVATAGGIO CON RETRY per ${appointment.client}...`, {
        timestamp: new Date().toISOString()
      });
      
      const result = await saveAppointmentWithRetry(
        appointment, 
        addAppointment, 
        existingAppointments, 
        i, 
        appointments.length
      );
      
      if (result.success) {
        savedCount++;
        console.log(`✅ [${i + 1}/${appointments.length}] SALVATO CON SUCCESSO! Progresso: ${savedCount}/${appointments.length}`, {
          client: appointment.client,
          savedCount,
          totalExpected: appointments.length,
          percentComplete: Math.round((savedCount / appointments.length) * 100),
          timestamp: new Date().toISOString()
        });
      } else {
        console.error(`❌ [${i + 1}/${appointments.length}] FALLIMENTO SALVATAGGIO:`, {
          client: appointment.client,
          error: result.error,
          savedSoFar: savedCount,
          totalExpected: appointments.length,
          timestamp: new Date().toISOString()
        });
        failedSaves.push(`${appointment.date} ${appointment.time} - ${appointment.client}: ${result.error}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore critico';
      console.error(`💥 [${i + 1}/${appointments.length}] ERRORE CRITICO DURANTE SALVATAGGIO:`, {
        client: appointment.client,
        error: errorMsg,
        errorObject: error,
        stack: error instanceof Error ? error.stack : 'No stack',
        savedSoFar: savedCount,
        totalExpected: appointments.length,
        timestamp: new Date().toISOString()
      });
      failedSaves.push(`${appointment.date} ${appointment.time} - ${appointment.client}: ${errorMsg}`);
    }
    
    // Aggiorna progress ogni appuntamento per mobile con dettagli
    if (progressToastId) {
      const tempoRimanente = Math.ceil((appointments.length - i - 1) * batchDelay / 1000);
      const mobileInfo = delays.isMobile ? 
        ` (mobile: ${tempoRimanente}s rimanenti)` : '';
      console.log(`📱 Aggiorno progress: ${savedCount}/${appointments.length}${mobileInfo}`);
      toast.loading(`Salvati ${savedCount}/${appointments.length}${mobileInfo}...`, { id: progressToastId });
    }
    
    // PAUSA OBBLIGATORIA TRA APPUNTAMENTI - DELAY MOBILE MASSIMO
    if (i < appointments.length - 1) {
      console.log(`⏳ PAUSA BATCH ${batchType.toUpperCase()} MOBILE V4: ${batchDelay}ms (${delays.isMobile ? '📱 MOBILE MASSIMO' : '💻 DESKTOP VELOCE'}) prima del prossimo`, {
        currentAppointment: i + 1,
        nextAppointment: i + 2,
        totalAppointments: appointments.length,
        delayType: delays.isMobile ? 'MOBILE_MASSIMO' : 'DESKTOP_FAST',
        delayMs: batchDelay,
        startTime: new Date().toISOString()
      });
      
      const startWait = Date.now();
      await new Promise(resolve => setTimeout(resolve, batchDelay));
      const endWait = Date.now();
      
      console.log(`⏳ PAUSA COMPLETATA in ${endWait - startWait}ms - delay richiesto: ${batchDelay}ms`, {
        actualDelay: endWait - startWait,
        requestedDelay: batchDelay,
        difference: Math.abs((endWait - startWait) - batchDelay),
        isAccurate: Math.abs((endWait - startWait) - batchDelay) < 100,
        endTime: new Date().toISOString()
      });
    }
  }

  if (progressToastId) {
    console.log(`📱 Dismissing progress toast`);
    toast.dismiss(progressToastId);
  }

  const successRate = Math.round((savedCount / appointments.length) * 100);
  
  console.log(`🏁 BATCH ${batchType.toUpperCase()} COMPLETATO - RISULTATI FINALI V4:`, {
    risultati: {
      salvati: savedCount,
      totale: appointments.length,
      falliti: failedSaves.length,
      successRate: `${successRate}%`
    },
    tempi: {
      tempoTotaleEffettivo: `circa ${Math.ceil((appointments.length * batchDelay) / 1000)}s`,
      modalitàUsata: delays.isMobile ? '📱 MOBILE (DELAY MASSIMI V4)' : '💻 DESKTOP (DELAY CORTI)',
      delayPerAppuntamento: `${batchDelay}ms`
    },
    valutazione: {
      risultato: successRate === 100 ? '🎉 SUCCESSO COMPLETO' : 
                successRate >= 80 ? '⚠️ SUCCESSO PARZIALE' : '❌ PROBLEMI CRITICI',
      noteImportanti: failedSaves.length > 0 ? 
        `${failedSaves.length} appuntamenti non salvati` : 
        'Tutti gli appuntamenti salvati correttamente'
    },
    dettagliFallimenti: failedSaves.length > 0 ? failedSaves : 'Nessun fallimento',
    timestamp: new Date().toISOString()
  });

  return { savedCount, failedSaves };
};
