
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
  const delays = getMobileDelays();
  const failedSaves: string[] = [];
  let savedCount = 0;

  if (appointments.length === 0) {
    return { savedCount: 0, failedSaves: [] };
  }

  console.log(`📋 Salvataggio ${appointments.length} appuntamenti ${batchType}...`);

  // Progress toast per operazioni lunghe
  if (appointments.length > 3 && batchType === 'recurring') {
    toast.loading(`Salvando ${appointments.length} appuntamenti ricorrenti...`, {
      id: 'recurring-save-progress'
    });
  }

  // SALVATAGGIO SEQUENZIALE ULTRA-ROBUSTO
  for (let i = 0; i < appointments.length; i++) {
    const appointment = appointments[i];
    
    console.log(`💾 [${i + 1}/${appointments.length}] PROCESSANDO ${batchType.toUpperCase()}:`, {
      date: appointment.date,
      time: appointment.time,
      client: appointment.client,
      progress: `${i + 1}/${appointments.length}`
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
      }
    } catch (criticalError) {
      const errorMsg = criticalError instanceof Error ? criticalError.message : 'Errore critico sconosciuto';
      console.error(`💥 [${i + 1}/${appointments.length}] ERRORE CRITICO:`, {
        error: errorMsg,
        appointment: appointment.date
      });
      failedSaves.push(`${batchType} ${i + 1} (${appointment.date}): ${errorMsg}`);
    }
    
    // Aggiorna progress toast periodicamente
    if (appointments.length > 3 && batchType === 'recurring' && (i + 1) % 2 === 0) {
      toast.loading(`Salvati ${savedCount}/${appointments.length} appuntamenti...`, {
        id: 'recurring-save-progress'
      });
    }
    
    // PAUSA FONDAMENTALE TRA SALVATAGGI - MAI SALTARE
    if (i < appointments.length - 1) {
      const delay = batchType === 'recurring' ? delays.recurringDelay : delays.additionalDelay;
      console.log(`⏱️ [${i + 1}/${appointments.length}] PAUSA OBBLIGATORIA di ${delay}ms prima di continuare...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Chiudi progress toast
  if (appointments.length > 3 && batchType === 'recurring') {
    toast.dismiss('recurring-save-progress');
  }

  return { savedCount, failedSaves };
};
