
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { saveAppointmentWithRetry } from './retryMechanism';
import { isMobileDevice, getMobileDelays } from './mobileDetection';

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
    return { savedCount: 0, failedSaves: [] };
  }

  console.log(`📋 INIZIO BATCH ${batchType.toUpperCase()} - ${appointments.length} appuntamenti - MOBILE: ${isMobile}`);

  // Progress toast SOLO per operazioni lunghe
  let progressToastId: string | number | undefined;
  if (appointments.length > 5 && batchType === 'recurring') {
    progressToastId = toast.loading(`Salvando ${appointments.length} appuntamenti ricorrenti...`);
  }

  // SALVATAGGIO SEQUENZIALE ULTRA-ROBUSTO
  for (let i = 0; i < appointments.length; i++) {
    const appointment = appointments[i];
    
    console.log(`💾 [${i + 1}/${appointments.length}] PROCESSANDO ${batchType.toUpperCase()}:`, {
      date: appointment.date,
      time: appointment.time,
      client: appointment.client,
      progress: `${i + 1}/${appointments.length}`,
      isMobile
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
        console.log(`✅ [${i + 1}/${appointments.length}] ${batchType.toUpperCase()} SALVATO! Progresso: ${savedCount}/${appointments.length}`);
      } else {
        console.error(`❌ [${i + 1}/${appointments.length}] ${batchType.toUpperCase()} FALLITO:`, result.error);
        failedSaves.push(`${batchType} ${i + 1} (${appointment.date}): ${result.error}`);
        // CONTINUA COMUNQUE - non fermare il processo
      }
    } catch (criticalError) {
      const errorMsg = criticalError instanceof Error ? criticalError.message : 'Errore critico sconosciuto';
      console.error(`💥 [${i + 1}/${appointments.length}] ERRORE CRITICO:`, {
        error: errorMsg,
        appointment: appointment.date
      });
      failedSaves.push(`${batchType} ${i + 1} (${appointment.date}): ${errorMsg}`);
      // CONTINUA COMUNQUE - non fermare il processo
    }
    
    // Aggiorna progress toast periodicamente
    if (progressToastId && (i + 1) % 3 === 0) {
      toast.loading(`Salvati ${savedCount}/${appointments.length} appuntamenti...`, {
        id: progressToastId
      });
    }
    
    // PAUSA FONDAMENTALE TRA SALVATAGGI - MAI SALTARE
    if (i < appointments.length - 1) {
      // Pausa aumentata significativamente per mobile
      const delay = isMobile ? 2000 : 800; // Raddoppiato per mobile
      console.log(`⏱️ [${i + 1}/${appointments.length}] PAUSA OBBLIGATORIA di ${delay}ms prima di continuare...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Chiudi progress toast
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
