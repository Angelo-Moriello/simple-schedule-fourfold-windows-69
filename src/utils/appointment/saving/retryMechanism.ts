
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { checkTimeConflicts } from './conflictDetection';
import { getMobileDelays } from './mobileDetection';

export interface SaveResult {
  success: boolean;
  error?: string;
}

export const saveAppointmentWithRetry = async (
  appointment: Appointment,
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[],
  index: number,
  total: number,
  maxRetries = 2
): Promise<SaveResult> => {
  const delays = getMobileDelays();
  
  console.log(`🔄 [${index + 1}/${total}] SALVATAGGIO - Inizio con delays:`, delays);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`💾 [${index + 1}/${total}] TENTATIVO ${attempt}/${maxRetries} per ${appointment.client}`);
    
    try {
      // Verifica conflitti
      if (existingAppointments.length > 0) {
        const hasConflict = await checkTimeConflicts(appointment, existingAppointments);
        if (hasConflict) {
          console.warn(`⚠️ Conflitto per ${appointment.client} - ${appointment.date} ${appointment.time}`);
          toast.warning(`Conflitto per ${appointment.client} il ${appointment.date}`);
        }
      }
      
      // SALVATAGGIO
      console.log(`💾 [${index + 1}/${total}] SALVANDO ${appointment.client}...`);
      addAppointment(appointment);
      
      // PAUSA OBBLIGATORIA - Usa effettivamente i delays
      console.log(`⏱️ [${index + 1}/${total}] PAUSA OBBLIGATORIA di ${delays.saveDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, delays.saveDelay));
      
      console.log(`✅ [${index + 1}/${total}] SALVATO ${appointment.client} con successo`);
      return { success: true };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error(`❌ [${index + 1}/${total}] ERRORE tentativo ${attempt}:`, errorMsg);
      
      if (attempt === maxRetries) {
        console.error(`❌ [${index + 1}/${total}] FALLITO definitivamente dopo ${maxRetries} tentativi`);
        return { success: false, error: errorMsg };
      }
      
      // Pausa prima del retry
      const retryDelay = delays.retryDelay(attempt);
      console.log(`⏱️ [${index + 1}/${total}] PAUSA RETRY di ${retryDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return { success: false, error: 'Fallito dopo tutti i tentativi' };
};
