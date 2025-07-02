
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
  
  console.log(`🚀 INIZIO BATCH ${batchType.toUpperCase()} - DELAY OTTIMIZZATI PER MOBILE:`, {
    appointmentsCount: appointments.length,
    batchDelay: `${batchDelay}ms`,
    batchType: batchType === 'recurring' ? '🔴 RICORRENTI (CRITICI)' : '🟡 AGGIUNTIVI',
    saveDelay: `${delays.saveDelay}ms`,
    isMobile: delays.isMobile,
    modalità: delays.isMobile ? '📱 MOBILE (DELAY SUPER LUNGHI)' : '💻 DESKTOP (DELAY NORMALI)',
    tempoTotaleStimato: `${Math.ceil((appointments.length * batchDelay) / 1000)}s`,
    confrontoDelay: {
      desktop: batchType === 'recurring' ? '1000ms' : '800ms',
      mobile: batchType === 'recurring' ? '6000ms' : '4000ms',
      attuale: `${batchDelay}ms`,
      differenza: delays.isMobile ? '+500% rispetto desktop' : 'standard'
    }
  });

  // Progress toast per batch grandi con info mobile
  let progressToastId: string | number | undefined;
  if (appointments.length > 1) {
    const mobileWarning = delays.isMobile ? ' (richiederà più tempo su mobile)' : '';
    progressToastId = toast.loading(`Salvando ${appointments.length} appuntamenti ${batchType}${mobileWarning}...`);
  }

  // SALVATAGGIO SEQUENZIALE CON DELAY MOBILE OTTIMIZZATI
  for (let i = 0; i < appointments.length; i++) {
    const appointment = appointments[i];
    
    console.log(`📝 [${i + 1}/${appointments.length}] PROCESSANDO ${batchType}: ${appointment.client} - ${appointment.date} ${appointment.time}`);
    
    try {
      const result = await saveAppointmentWithRetry(
        appointment, 
        addAppointment, 
        existingAppointments, 
        i, 
        appointments.length
      );
      
      if (result.success) {
        savedCount++;
        console.log(`✅ [${i + 1}/${appointments.length}] SALVATO! Progresso: ${savedCount}/${appointments.length}`);
      } else {
        console.error(`❌ [${i + 1}/${appointments.length}] FALLITO:`, result.error);
        failedSaves.push(`${appointment.date} ${appointment.time} - ${appointment.client}: ${result.error}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore critico';
      console.error(`💥 [${i + 1}/${appointments.length}] ERRORE CRITICO:`, errorMsg);
      failedSaves.push(`${appointment.date} ${appointment.time} - ${appointment.client}: ${errorMsg}`);
    }
    
    // Aggiorna progress ogni appuntamento per mobile
    if (progressToastId) {
      const mobileInfo = delays.isMobile ? ` (mobile: ${Math.ceil((appointments.length - i - 1) * batchDelay / 1000)}s rimanenti)` : '';
      toast.loading(`Salvati ${savedCount}/${appointments.length}${mobileInfo}...`, { id: progressToastId });
    }
    
    // PAUSA OBBLIGATORIA TRA APPUNTAMENTI - DELAY MOBILE OTTIMIZZATO
    if (i < appointments.length - 1) {
      console.log(`⏳ PAUSA BATCH ${batchType} MOBILE-OTTIMIZZATA: ${batchDelay}ms (${delays.isMobile ? '📱 MOBILE' : '💻 DESKTOP'}) prima del prossimo`);
      const startWait = Date.now();
      await new Promise(resolve => setTimeout(resolve, batchDelay));
      const endWait = Date.now();
      console.log(`⏳ PAUSA COMPLETATA in ${endWait - startWait}ms - delay richiesto: ${batchDelay}ms`);
    }
  }

  if (progressToastId) {
    toast.dismiss(progressToastId);
  }

  const successRate = Math.round((savedCount / appointments.length) * 100);
  
  console.log(`🏁 BATCH ${batchType.toUpperCase()} COMPLETATO:`, {
    salvati: savedCount,
    totale: appointments.length,
    falliti: failedSaves.length,
    successRate: `${successRate}%`,
    tempoTotaleEffettivo: `circa ${Math.ceil((appointments.length * batchDelay) / 1000)}s`,
    modalitàUsata: delays.isMobile ? '📱 MOBILE (DELAY LUNGHI)' : '💻 DESKTOP (DELAY CORTI)',
    risultato: successRate === 100 ? '🎉 SUCCESSO COMPLETO' : successRate >= 80 ? '⚠️ SUCCESSO PARZIALE' : '❌ PROBLEMI CRITICI'
  });

  return { savedCount, failedSaves };
};
