
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

  // Usa i delays corretti per ogni tipo di batch
  const batchDelay = batchType === 'recurring' ? delays.recurringDelay : delays.additionalDelay;
  
  console.log(`📋 INIZIO BATCH ${batchType.toUpperCase()} - TIMING REALE:`, {
    appointmentsCount: appointments.length,
    batchDelay: batchDelay,
    saveDelay: delays.saveDelay,
    connectionType: delays.connectionType,
    totalEstimatedTime: `${(appointments.length * batchDelay) / 1000}s`
  });

  // Progress toast
  let progressToastId: string | number | undefined;
  if (appointments.length > 2) {
    progressToastId = toast.loading(`Salvando ${appointments.length} appuntamenti ${batchType}...`);
  }

  // SALVATAGGIO SEQUENZIALE CON TEMPI CORRETTI
  for (let i = 0; i < appointments.length; i++) {
    const appointment = appointments[i];
    
    console.log(`💾 [${i + 1}/${appointments.length}] PROCESSANDO BATCH ${batchType}: ${appointment.client} - ${appointment.date} ${appointment.time}`);
    
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
    
    // Aggiorna progress
    if (progressToastId && (i + 1) % 2 === 0) {
      toast.loading(`Salvati ${savedCount}/${appointments.length} appuntamenti...`, { id: progressToastId });
    }
    
    // PAUSA OBBLIGATORIA TRA APPUNTAMENTI - Usa i delays effettivi
    if (i < appointments.length - 1) {
      console.log(`⏱️ PAUSA BATCH ${batchType} di ${batchDelay}ms prima del prossimo appuntamento...`);
      await new Promise(resolve => setTimeout(resolve, batchDelay));
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
    tempoTotale: `${(appointments.length * batchDelay) / 1000}s`
  });

  return { savedCount, failedSaves };
};
