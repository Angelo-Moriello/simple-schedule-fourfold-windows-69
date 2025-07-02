
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
  maxRetries = 3
): Promise<SaveResult> => {
  const delays = getMobileDelays();
  
  console.log(`🔄 [${index + 1}/${total}] INIZIO SALVATAGGIO - Mobile delays:`, {
    saveDelay: delays.saveDelay,
    retryDelay: delays.retryDelay(1),
    additionalDelay: delays.additionalDelay,
    recurringDelay: delays.recurringDelay,
    isMobile: /Mobi|Android/i.test(navigator.userAgent)
  });
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`💾 [${index + 1}/${total}] TENTATIVO ${attempt}/${maxRetries} per ${appointment.client} - ${appointment.date} ${appointment.time}`);
    
    try {
      // Verifica conflitti con delay aggiuntivo su mobile
      if (existingAppointments.length > 0) {
        const hasConflict = await checkTimeConflicts(appointment, existingAppointments);
        if (hasConflict) {
          console.warn(`⚠️ Conflitto rilevato per ${appointment.client}`);
          toast.warning(`Conflitto per ${appointment.client} il ${appointment.date}`);
        }
      }
      
      // PAUSA PRE-SALVATAGGIO per mobile
      console.log(`⏳ [${index + 1}/${total}] PAUSA PRE-SALVATAGGIO: ${delays.saveDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, delays.saveDelay));
      
      // SALVATAGGIO
      console.log(`💾 [${index + 1}/${total}] SALVANDO ${appointment.client}...`);
      const startTime = Date.now();
      
      addAppointment(appointment);
      
      const endTime = Date.now();
      console.log(`✅ [${index + 1}/${total}] SALVATO ${appointment.client} in ${endTime - startTime}ms`);
      
      // PAUSA POST-SALVATAGGIO per stabilizzare
      console.log(`⏳ [${index + 1}/${total}] PAUSA POST-SALVATAGGIO: ${delays.saveDelay / 2}ms`);
      await new Promise(resolve => setTimeout(resolve, delays.saveDelay / 2));
      
      return { success: true };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error(`❌ [${index + 1}/${total}] ERRORE tentativo ${attempt}:`, errorMsg);
      
      if (attempt === maxRetries) {
        console.error(`❌ [${index + 1}/${total}] FALLIMENTO DEFINITIVO dopo ${maxRetries} tentativi`);
        return { success: false, error: errorMsg };
      }
      
      // Pausa progressiva tra i retry
      const retryDelay = delays.retryDelay(attempt);
      console.log(`⏱️ [${index + 1}/${total}] PAUSA RETRY ${attempt}: ${retryDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return { success: false, error: 'Fallito dopo tutti i tentativi' };
};
