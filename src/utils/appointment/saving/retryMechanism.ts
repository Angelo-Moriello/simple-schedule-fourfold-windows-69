
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
  maxRetries = 7 // Aumentato a 7 per mobile ultra-robusto
): Promise<SaveResult> => {
  const delays = getMobileDelays();
  
  console.log(`🔄 [${index + 1}/${total}] INIZIO SALVATAGGIO MOBILE V3 - ULTRA-ROBUSTO:`, {
    appointment: `${appointment.client} - ${appointment.date} ${appointment.time}`,
    mobileDelays: {
      saveDelay: `${delays.saveDelay}ms`,
      retryDelay: `${delays.retryDelay(1)}ms (primo retry)`,
      isMobile: delays.isMobile
    },
    maxRetries,
    modalità: delays.isMobile ? '📱 MOBILE (RETRY ULTRA-AGGRESSIVI V3)' : '💻 DESKTOP (RETRY STANDARD)',
    stimaTempoMassimo: delays.isMobile ? 
      `${Math.ceil((delays.saveDelay + maxRetries * delays.retryDelay(3)) / 1000)}s` : 
      `${Math.ceil((delays.saveDelay + maxRetries * delays.retryDelay(3)) / 1000)}s`
  });
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`💾 [${index + 1}/${total}] TENTATIVO ${attempt}/${maxRetries} per ${appointment.client} - ${appointment.date} ${appointment.time}`, {
      tentativo: {
        numero: attempt,
        maxTentativi: maxRetries,
        percentualeCompletamento: Math.round((attempt / maxRetries) * 100)
      },
      appuntamento: {
        client: appointment.client,
        date: appointment.date,
        time: appointment.time,
        employeeId: appointment.employeeId,
        serviceType: appointment.serviceType
      },
      mobile: {
        isMobile: delays.isMobile,
        saveDelay: delays.saveDelay,
        nextRetryDelay: delays.retryDelay(attempt)
      }
    });
    
    try {
      // Verifica conflitti
      if (existingAppointments.length > 0) {
        console.log(`🔍 [${index + 1}/${total}] Verifica conflitti per ${appointment.client}...`);
        const hasConflict = await checkTimeConflicts(appointment, existingAppointments);
        if (hasConflict) {
          console.warn(`⚠️ Conflitto rilevato per ${appointment.client}`, {
            appointment: {
              client: appointment.client,
              date: appointment.date,
              time: appointment.time
            },
            conflictType: 'TIME_OVERLAP'
          });
          toast.warning(`Conflitto per ${appointment.client} il ${appointment.date}`);
        }
      }
      
      // PAUSA PRE-SALVATAGGIO - DELAY MOBILE ULTRA-OTTIMIZZATO
      console.log(`⏳ [${index + 1}/${total}] PAUSA PRE-SALVATAGGIO V3: ${delays.saveDelay}ms (${delays.isMobile ? '📱 MOBILE ULTRA-LENTO' : '💻 DESKTOP VELOCE'})`);
      await new Promise(resolve => setTimeout(resolve, delays.saveDelay));
      
      // SALVATAGGIO CON LOGGING ULTRA-DETTAGLIATO
      console.log(`💾 [${index + 1}/${total}] ESECUZIONE SALVATAGGIO ${appointment.client}... (tentativo ${attempt}/${maxRetries})`, {
        pre_salvataggio: {
          client: appointment.client,
          date: appointment.date,
          time: appointment.time,
          attempt: attempt,
          timestamp: new Date().toISOString()
        }
      });
      
      const startTime = Date.now();
      
      // SALVATAGGIO EFFETTIVO
      addAppointment(appointment);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ [${index + 1}/${total}] SALVATAGGIO COMPLETATO ${appointment.client} in ${duration}ms (tentativo ${attempt}/${maxRetries})`, {
        post_salvataggio: {
          client: appointment.client,
          date: appointment.date,
          time: appointment.time,
          duration: `${duration}ms`,
          attempt: attempt,
          success: true,
          timestamp: new Date().toISOString()
        }
      });
      
      // PAUSA POST-SALVATAGGIO - PIÙ LUNGA PER MOBILE V3
      const postDelay = delays.isMobile ? Math.floor(delays.saveDelay / 2) : Math.floor(delays.saveDelay / 3);
      console.log(`⏳ [${index + 1}/${total}] PAUSA POST-SALVATAGGIO V3: ${postDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, postDelay));
      
      return { success: true };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error(`❌ [${index + 1}/${total}] ERRORE tentativo ${attempt}/${maxRetries}:`, {
        errore: {
          message: errorMsg,
          attempt: attempt,
          maxRetries: maxRetries,
          client: appointment.client,
          error: error
        }
      });
      
      if (attempt === maxRetries) {
        console.error(`❌ [${index + 1}/${total}] FALLIMENTO DEFINITIVO dopo ${maxRetries} tentativi`, {
          fallimento_finale: {
            client: appointment.client,
            date: appointment.date,
            time: appointment.time,
            totalAttempts: maxRetries,
            finalError: errorMsg,
            timestamp: new Date().toISOString()
          }
        });
        return { success: false, error: errorMsg };
      }
      
      // Pausa progressiva tra i retry - DELAY MOBILE ULTRA-OTTIMIZZATO V3
      const retryDelay = delays.retryDelay(attempt);
      console.log(`⏱️ [${index + 1}/${total}] PAUSA RETRY ${attempt} V3: ${retryDelay}ms (${delays.isMobile ? '📱 MOBILE ULTRA-LENTO' : '💻 DESKTOP VELOCE'})`, {
        retry_info: {
          attempt: attempt,
          nextAttempt: attempt + 1,
          maxRetries: maxRetries,
          retryDelay: `${retryDelay}ms`,
          isMobile: delays.isMobile,
          client: appointment.client
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return { success: false, error: 'Fallito dopo tutti i tentativi' };
};
