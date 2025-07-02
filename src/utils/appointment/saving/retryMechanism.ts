
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { checkTimeConflicts } from './conflictDetection';
import { isMobileDevice, getMobileDelays } from './mobileDetection';

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
  maxRetries = 3 // Ridotto per evitare loop infiniti
): Promise<SaveResult> => {
  const isMobile = isMobileDevice();
  const delays = getMobileDelays();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 [${index + 1}/${total}] TENTATIVO ${attempt}/${maxRetries} - MOBILE: ${isMobile}`, {
      client: appointment.client,
      date: appointment.date,
      time: appointment.time,
      id: appointment.id.substring(0, 8),
      timestamp: new Date().toISOString()
    });
    
    try {
      // Verifica conflitti solo se ci sono appuntamenti esistenti
      if (existingAppointments.length > 0) {
        const hasConflict = await checkTimeConflicts(appointment, existingAppointments);
        if (hasConflict) {
          console.warn(`⚠️ Conflitto rilevato per ${appointment.client} alle ${appointment.time} del ${appointment.date}`);
          toast.warning(`Conflitto rilevato per ${appointment.client} il ${appointment.date} alle ${appointment.time}`);
        }
      }
      
      // SALVATAGGIO ULTRA-SEMPLIFICATO
      console.log(`💾 [${index + 1}/${total}] SALVATAGGIO DIRETTO`);
      
      // Chiamata diretta al salvataggio
      addAppointment(appointment);
      
      // Pausa OBBLIGATORIA per mobile
      const saveDelay = isMobile ? 800 : 300; // Aumentato significativamente per mobile
      await new Promise(resolve => setTimeout(resolve, saveDelay));
      
      console.log(`✅ [${index + 1}/${total}] SALVATO CON SUCCESSO al tentativo ${attempt}`);
      return { success: true };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error(`❌ [${index + 1}/${total}] ERRORE tentativo ${attempt}/${maxRetries}:`, {
        error: errorMsg,
        appointment: {
          client: appointment.client,
          date: appointment.date,
          time: appointment.time
        },
        timestamp: new Date().toISOString()
      });
      
      if (attempt === maxRetries) {
        console.error(`❌ [${index + 1}/${total}] FALLITO DEFINITIVAMENTE dopo ${maxRetries} tentativi`);
        // NON BLOCCARE IL PROCESSO - continua con il prossimo
        return { success: false, error: errorMsg };
      }
      
      // Pausa progressiva tra retry (aumentata per mobile)
      const retryDelay = isMobile ? attempt * 1500 : attempt * 700;
      console.log(`⏱️ [${index + 1}/${total}] Pausa retry di ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return { success: false, error: 'Fallito dopo tutti i tentativi' };
};
