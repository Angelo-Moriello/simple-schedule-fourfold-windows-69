
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

  // Seleziona il delay corretto per il tipo di batch
  const batchDelay = batchType === 'recurring' ? delays.recurringDelay : delays.additionalDelay;
  
  console.log(`📋 INIZIO BATCH ${batchType.toUpperCase()} - CONFIGURAZIONE CORRETTA:`, {
    appointmentsCount: appointments.length,
    batchDelay: batchDelay,
    batchType: batchType === 'recurring' ? 'RICORRENTI' : 'AGGIUNTIVI',
    saveDelay: delays.saveDelay,
    isMobile: delays.isMobile,
    modalità: delays.isMobile ? 'MOBILE (DELAY LUNGHI)' : 'DESKTOP (DELAY CORTI)',
    tempoTotaleStimato: `${Math.ceil((appointments.length * batchDelay) / 1000)}s`,
    confrontoDelay: {
      desktop: batchType === 'recurring' ? '800ms' : '600ms',
      mobile: batchType === 'recurring' ? '4000ms' : '3000ms',
      attuale: `${batchDelay}ms`
    }
  });

  // Progress toast per batch grandi
  let progressToastId: string | number | undefined;
  if (appointments.length > 2) {
    progressToastId = toast.loading(`Salvando ${appointments.length} appuntamenti ${batchType}...`);
  }

  // SALVATAGGIO SEQUENZIALE CON DELAYS CORRETTI
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
    
    // Aggiorna progress ogni 2 appuntamenti
    if (progressToastId && (i + 1) % 2 === 0) {
      toast.loading(`Salvati ${savedCount}/${appointments.length} appuntamenti...`, { id: progressToastId });
    }
    
    // PAUSA OBBLIGATORIA TRA APPUNTAMENTI DEL BATCH - DELAY CORRETTO
    if (i < appointments.length - 1) {
      console.log(`⏳ PAUSA BATCH ${batchType} CORRETTA: ${batchDelay}ms (${delays.isMobile ? 'MOBILE' : 'DESKTOP'}) prima del prossimo appuntamento`);
      const startWait = Date.now();
      await new Promise(resolve => setTimeout(resolve, batchDelay));
      const endWait = Date.now();
      console.log(`⏳ PAUSA BATCH COMPLETATA in ${endWait - startWait}ms - delay richiesto: ${batchDelay}ms`);
    }
  }

  if (progressToastId) {
    toast.dismiss(progressToastId);
  }

  console.log(`🏁 BATCH ${batchType.toUpperCase()} COMPLETATO:`, {
    salvati: savedCount,
    totale: appointments.length,
    falliti: failedSaves.length,
    successRate: `${Math.round((savedCount / appointments.length) * 100)}%`,
    tempoTotaleEffettivo: `circa ${Math.ceil((appointments.length * batchDelay) / 1000)}s`,
    modalitàUsata: delays.isMobile ? 'MOBILE' : 'DESKTOP'
  });

  return { savedCount, failedSaves };
};
