
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';

// Funzione per verificare conflitti di orario
const checkTimeConflicts = async (
  newAppointment: Appointment,
  existingAppointments: Appointment[]
): Promise<boolean> => {
  const newStartTime = new Date(`${newAppointment.date}T${newAppointment.time}`);
  const newEndTime = new Date(newStartTime.getTime() + newAppointment.duration * 60000);
  
  for (const existing of existingAppointments) {
    if (existing.employeeId === newAppointment.employeeId && 
        existing.date === newAppointment.date) {
      
      const existingStartTime = new Date(`${existing.date}T${existing.time}`);
      const existingEndTime = new Date(existingStartTime.getTime() + existing.duration * 60000);
      
      // Verifica sovrapposizione
      if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
        console.warn(`Conflitto rilevato per ${newAppointment.client} alle ${newAppointment.time} del ${newAppointment.date}`);
        return true;
      }
    }
  }
  return false;
};

// Sistema di coda per serializzare le operazioni di salvataggio
class AppointmentSaveQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log('DEBUG - 🔄 Inizio processamento coda, elementi:', this.queue.length);

    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        try {
          await operation();
          // Pausa più lunga tra operazioni per evitare sovraccarico
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
          console.error('DEBUG - ❌ Errore nella coda:', error);
        }
      }
    }

    this.isProcessing = false;
    console.log('DEBUG - ✅ Coda completata');
  }
}

const saveQueue = new AppointmentSaveQueue();

// Funzione per salvare un singolo appuntamento con retry avanzato
const saveAppointmentWithAdvancedRetry = async (
  appointment: Appointment,
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[],
  maxRetries = 5
): Promise<boolean> => {
  return saveQueue.add(async () => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`DEBUG - 💾 Tentativo ${attempt}/${maxRetries} per salvare:`, {
          client: appointment.client,
          date: appointment.date,
          time: appointment.time,
          id: appointment.id.substring(0, 8)
        });
        
        // Verifica conflitti solo se necessario
        if (existingAppointments.length > 0) {
          const hasConflict = await checkTimeConflicts(appointment, existingAppointments);
          if (hasConflict) {
            console.warn(`DEBUG - ⚠️ Conflitto rilevato per ${appointment.client} alle ${appointment.time} del ${appointment.date}`);
            toast.warning(`Conflitto rilevato per ${appointment.client} il ${appointment.date} alle ${appointment.time}`);
          }
        }
        
        await addAppointment(appointment);
        console.log(`DEBUG - ✅ Appuntamento salvato con successo al tentativo ${attempt}`);
        return true;
        
      } catch (error) {
        console.error(`DEBUG - ❌ Errore al tentativo ${attempt}:`, error);
        
        if (attempt === maxRetries) {
          console.error(`DEBUG - ❌ Fallito dopo ${maxRetries} tentativi:`, error);
          return false;
        }
        
        // Backoff esponenziale con jitter per evitare thundering herd
        const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;
        
        console.log(`DEBUG - ⏱️ Attesa ${Math.round(delay)}ms prima del prossimo tentativo`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return false;
  });
};

export const saveAppointments = async (
  mainAppointment: Appointment,
  additionalAppointments: Appointment[],
  recurringAppointments: Appointment[],
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[] = []
) => {
  console.log('DEBUG - 🚀 Inizio salvataggio ottimizzato per mobile:', {
    mainAppointment: mainAppointment,
    additionalCount: additionalAppointments.length,
    recurringCount: recurringAppointments.length,
    existingAppointments: existingAppointments.length,
    isMobile: /Mobi|Android/i.test(navigator.userAgent)
  });

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  let savedRecurringCount = 0;
  const failedSaves: string[] = [];

  try {
    // 1. Salva appuntamento principale
    console.log('DEBUG - 📋 Salvataggio appuntamento principale...');
    const mainSaved = await saveAppointmentWithAdvancedRetry(mainAppointment, addAppointment, existingAppointments);
    if (!mainSaved) {
      throw new Error('Impossibile salvare appuntamento principale');
    }
    console.log('DEBUG - ✅ Appuntamento principale salvato');

    // 2. Salva appuntamenti aggiuntivi per lo stesso giorno
    if (additionalAppointments.length > 0) {
      console.log(`DEBUG - 📋 Salvataggio ${additionalAppointments.length} appuntamenti aggiuntivi...`);
      for (let i = 0; i < additionalAppointments.length; i++) {
        const additionalAppointment = additionalAppointments[i];
        try {
          const additionalSaved = await saveAppointmentWithAdvancedRetry(additionalAppointment, addAppointment, existingAppointments);
          if (additionalSaved) {
            console.log(`DEBUG - ✅ Appuntamento aggiuntivo ${i + 1}/${additionalAppointments.length} salvato`);
          } else {
            failedSaves.push(`Evento aggiuntivo ${i + 1}`);
          }
        } catch (error) {
          console.error(`ERRORE - Salvataggio appuntamento aggiuntivo ${i + 1}:`, error);
          failedSaves.push(`Evento aggiuntivo ${i + 1}`);
        }
      }
    }

    // 3. Salva appuntamenti ricorrenti con sistema ottimizzato
    if (recurringAppointments.length > 0) {
      console.log(`DEBUG - 📅 Salvataggio ${recurringAppointments.length} appuntamenti ricorrenti...`);
      
      // Mostra progress per operazioni lunghe
      if (recurringAppointments.length > 5) {
        toast.loading(`Salvando ${recurringAppointments.length} appuntamenti ricorrenti...`, {
          id: 'recurring-save-progress'
        });
      }
      
      for (let i = 0; i < recurringAppointments.length; i++) {
        const recurringAppointment = recurringAppointments[i];
        
        try {
          console.log(`DEBUG - 💾 Salvando ricorrente ${i + 1}/${recurringAppointments.length}:`, recurringAppointment.date);
          
          const recurringSaved = await saveAppointmentWithAdvancedRetry(recurringAppointment, addAppointment, existingAppointments);
          
          if (recurringSaved) {
            savedRecurringCount++;
            console.log(`DEBUG - ✅ Ricorrente ${i + 1} salvato! Progresso: ${savedRecurringCount}/${recurringAppointments.length}`);
            
            // Aggiorna progress per operazioni lunghe
            if (recurringAppointments.length > 5) {
              toast.loading(`Salvati ${savedRecurringCount}/${recurringAppointments.length} appuntamenti...`, {
                id: 'recurring-save-progress'
              });
            }
          } else {
            console.error(`DEBUG - ❌ Ricorrente ${i + 1} fallito`);
            failedSaves.push(`Ricorrente ${i + 1} (${recurringAppointment.date})`);
          }
          
        } catch (error) {
          console.error(`❌ Errore salvando ricorrente ${i + 1} per ${recurringAppointment.date}:`, error);
          failedSaves.push(`Ricorrente ${i + 1} (${recurringAppointment.date})`);
        }
      }
      
      // Chiudi progress toast
      if (recurringAppointments.length > 5) {
        toast.dismiss('recurring-save-progress');
      }
    }
    
  } catch (error) {
    console.error('ERRORE CRITICO nel salvataggio:', error);
    throw error;
  }
  
  console.log('DEBUG - 🏁 Salvataggio completato:', {
    savedRecurringCount,
    totalRequested: recurringAppointments.length,
    failedSaves: failedSaves.length,
    successRate: recurringAppointments.length > 0 ? `${Math.round((savedRecurringCount / recurringAppointments.length) * 100)}%` : '100%'
  });
  
  return { savedRecurringCount, failedSaves };
};

export const generateSuccessMessage = (
  totalMainEvents: number,
  savedRecurringCount: number,
  totalRecurringRequested: number,
  failedSaves: string[] = []
): string => {
  let successMessage = `${totalMainEvents} appuntament${totalMainEvents > 1 ? 'i creati' : 'o creato'} con successo!`;
  
  if (savedRecurringCount > 0) {
    successMessage += ` Inoltre ${savedRecurringCount} appuntament${savedRecurringCount > 1 ? 'i ricorrenti creati' : 'o ricorrente creato'}`;
    
    if (totalRecurringRequested > savedRecurringCount) {
      successMessage += ` su ${totalRecurringRequested} richiesti`;
    }
    successMessage += '.';
  }
  
  if (failedSaves.length > 0) {
    successMessage += ` Attenzione: ${failedSaves.length} salvataggi non riusciti.`;
  }
  
  console.log('DEBUG - 📝 Messaggio di successo generato:', successMessage);
  return successMessage;
};
