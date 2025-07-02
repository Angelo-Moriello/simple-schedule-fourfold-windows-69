
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

// Funzione per salvare un singolo appuntamento con retry
const saveAppointmentWithRetry = async (
  appointment: Appointment,
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[],
  maxRetries = 3
): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`DEBUG - Tentativo ${attempt}/${maxRetries} per salvare appuntamento:`, {
        client: appointment.client,
        date: appointment.date,
        time: appointment.time
      });
      
      const hasConflict = await checkTimeConflicts(appointment, existingAppointments);
      if (hasConflict) {
        console.warn(`DEBUG - ⚠️ Conflitto rilevato per ${appointment.client} alle ${appointment.time} del ${appointment.date}`);
        toast.warning(`Conflitto rilevato per ${appointment.client} il ${appointment.date} alle ${appointment.time}`);
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
      
      // Attendi prima del prossimo tentativo
      const delay = attempt * 1000; // 1s, 2s, 3s
      console.log(`DEBUG - ⏱️ Attesa ${delay}ms prima del prossimo tentativo`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
};

export const saveAppointments = async (
  mainAppointment: Appointment,
  additionalAppointments: Appointment[],
  recurringAppointments: Appointment[],
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[] = []
) => {
  console.log('DEBUG - 🚀 Inizio salvataggio appuntamenti:', {
    mainAppointment: mainAppointment,
    additionalCount: additionalAppointments.length,
    recurringCount: recurringAppointments.length,
    existingAppointments: existingAppointments.length,
    isMobile: /Mobi|Android/i.test(navigator.userAgent)
  });

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  let savedRecurringCount = 0;
  const failedSaves: string[] = [];

  // Save main appointment with retry
  try {
    const mainSaved = await saveAppointmentWithRetry(mainAppointment, addAppointment, existingAppointments);
    if (!mainSaved) {
      throw new Error('Impossibile salvare appuntamento principale dopo 3 tentativi');
    }
    console.log('DEBUG - ✅ Appuntamento principale salvato');
  } catch (error) {
    console.error('ERRORE - Salvataggio appuntamento principale:', error);
    throw error;
  }
  
  // Save additional appointments for same day with retry
  for (let i = 0; i < additionalAppointments.length; i++) {
    const additionalAppointment = additionalAppointments[i];
    try {
      const additionalSaved = await saveAppointmentWithRetry(additionalAppointment, addAppointment, existingAppointments);
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

  // Save recurring appointments with improved sequential processing for mobile
  console.log(`DEBUG - 📱 Processamento di ${recurringAppointments.length} appuntamenti ricorrenti`);
  
  for (let i = 0; i < recurringAppointments.length; i++) {
    const recurringAppointment = recurringAppointments[i];
    
    try {
      console.log(`DEBUG - 💾 Salvando appuntamento ricorrente ${i + 1}/${recurringAppointments.length} per data:`, recurringAppointment.date);
      
      const recurringSaved = await saveAppointmentWithRetry(recurringAppointment, addAppointment, existingAppointments, 2); // Meno retry per ricorrenti
      
      if (recurringSaved) {
        savedRecurringCount++;
        console.log(`DEBUG - ✅ Appuntamento ricorrente ${i + 1} salvato! Progresso: ${savedRecurringCount}/${recurringAppointments.length}`);
      } else {
        console.error(`DEBUG - ❌ Appuntamento ricorrente ${i + 1} fallito dopo tentativi`);
        failedSaves.push(`Ricorrente ${i + 1} (${recurringAppointment.date})`);
      }
      
      // Pausa più lunga su mobile per evitare race conditions
      if (isMobile && i < recurringAppointments.length - 1) {
        const delay = Math.min(300 + (i * 50), 1000); // Da 300ms a 1s max
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`DEBUG - ⏱️ Pausa di ${delay}ms dopo ${i + 1} salvataggi`);
      }
      
    } catch (error) {
      console.error(`❌ Errore salvando appuntamento ricorrente ${i + 1} per ${recurringAppointment.date}:`, error);
      failedSaves.push(`Ricorrente ${i + 1} (${recurringAppointment.date})`);
    }
  }
  
  console.log('DEBUG - 🏁 Salvataggio completato:', {
    savedRecurringCount,
    totalRequested: recurringAppointments.length,
    failedSaves: failedSaves.length,
    successRate: recurringAppointments.length > 0 ? `${Math.round((savedRecurringCount / recurringAppointments.length) * 100)}%` : '100%'
  });
  
  if (failedSaves.length > 0) {
    console.warn('DEBUG - ⚠️ Salvataggi falliti:', failedSaves);
  }
  
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
