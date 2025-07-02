
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { checkTimeConflicts } from './conflictDetection';
import { isMobileDevice } from './mobileDetection';

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
  maxRetries = 2 // Ridotto drasticamente per mobile
): Promise<SaveResult> => {
  const isMobile = isMobileDevice();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 [${index + 1}/${total}] SALVATAGGIO TENTATIVO ${attempt}/${maxRetries}`, {
      client: appointment.client,
      date: appointment.date,
      time: appointment.time,
      mobile: isMobile
    });
    
    try {
      // Verifica conflitti solo se necessario
      if (existingAppointments.length > 0) {
        const hasConflict = await checkTimeConflicts(appointment, existingAppointments);
        if (hasConflict) {
          console.warn(`⚠️ Conflitto per ${appointment.client} - ${appointment.date} ${appointment.time}`);
          toast.warning(`Conflitto per ${appointment.client} il ${appointment.date}`);
        }
      }
      
      // SALVATAGGIO DIRETTO SENZA COMPLICAZIONI
      console.log(`💾 [${index + 1}/${total}] SALVATAGGIO DIRETTO`);
      addAppointment(appointment);
      
      // Pausa minima ma sufficiente
      const delay = isMobile ? 500 : 200;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`✅ [${index + 1}/${total}] SALVATO con successo`);
      return { success: true };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error(`❌ [${index + 1}/${total}] ERRORE tentativo ${attempt}:`, errorMsg);
      
      if (attempt === maxRetries) {
        console.error(`❌ [${index + 1}/${total}] FALLITO dopo ${maxRetries} tentativi`);
        return { success: false, error: errorMsg };
      }
      
      // Pausa breve tra retry
      const retryDelay = isMobile ? 1000 : 500;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return { success: false, error: 'Fallito dopo tutti i tentativi' };
};
