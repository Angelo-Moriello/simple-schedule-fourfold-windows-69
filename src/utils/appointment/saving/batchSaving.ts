
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { saveAppointmentWithRetry } from './retryMechanism';
import { isMobileDevice } from './mobileDetection';

export const saveAppointmentsBatch = async (
  appointments: Appointment[],
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[],
  batchType: 'additional' | 'recurring'
): Promise<{ savedCount: number; failedSaves: string[] }> => {
  const isMobile = isMobileDevice();
  const failedSaves: string[] = [];
  let savedCount = 0;

  if (appointments.length === 0) {
    console.log(`📋 BATCH ${batchType} - Nessun appuntamento da salvare`);
    return { savedCount: 0, failedSaves: [] };
  }

  console.log(`📋 INIZIO BATCH ${batchType.toUpperCase()} - ${appointments.length} appuntamenti - MOBILE: ${isMobile}`);

  // Progress toast solo per batch grandi
  let progressToastId: string | number | undefined;
  if (appointments.length > 3) {
    progressToastId = toast.loading(`Salvando ${appointments.length} appuntamenti...`);
  }

  // SALVATAGGIO SEQUENZIALE SEMPLIFICATO
  for (let i = 0; i < appointments.length; i++) {
    const appointment = appointments[i];
    
    console.log(`💾 [${i + 1}/${appointments.length}] PROCESSANDO:`, {
      type: batchType,
      date: appointment.date,
      time: appointment.time,
      client: appointment.client
    });
    
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
        console.log(`✅ [${i + 1}/${appointments.length}] SALVATO! Total: ${savedCount}/${appointments.length}`);
      } else {
        console.error(`❌ [${i + 1}/${appointments.length}] FALLITO:`, result.error);
        failedSaves.push(`${appointment.date} ${appointment.time}: ${result.error}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore critico';
      console.error(`💥 [${i + 1}/${appointments.length}] ERRORE CRITICO:`, errorMsg);
      failedSaves.push(`${appointment.date} ${appointment.time}: ${errorMsg}`);
    }
    
    // Aggiorna progress
    if (progressToastId && (i + 1) % 2 === 0) {
      toast.loading(`Salvati ${savedCount}/${appointments.length}...`, { id: progressToastId });
    }
    
    // Pausa tra salvataggi - FONDAMENTALE
    if (i < appointments.length - 1) {
      const delay = isMobile ? 800 : 300; // Ridotto ma sufficiente
      console.log(`⏱️ Pausa di ${delay}ms prima del prossimo...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  if (progressToastId) {
    toast.dismiss(progressToastId);
  }

  console.log(`🏁 BATCH ${batchType.toUpperCase()} COMPLETATO:`, {
    salvati: savedCount,
    totale: appointments.length,
    falliti: failedSaves.length,
    successRate: `${Math.round((savedCount / appointments.length) * 100)}%`
  });

  return { savedCount, failedSaves };
};
