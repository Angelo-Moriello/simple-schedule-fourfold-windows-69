
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
    isMobile: /Mobi|Android/i.test(navigator.userAgent)
  });

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  let savedRecurringCount = 0;
  const failedSaves: string[] = [];

  // Save main appointment with conflict check
  try {
    const hasConflict = await checkTimeConflicts(mainAppointment, existingAppointments);
    if (hasConflict) {
      console.warn('DEBUG - ⚠️ Conflitto rilevato per appuntamento principale, salvataggio comunque...');
      toast.warning(`Attenzione: possibile conflitto di orario per ${mainAppointment.client} alle ${mainAppointment.time}`);
    }
    
    await addAppointment(mainAppointment);
    console.log('DEBUG - ✅ Appuntamento principale salvato con successo');
  } catch (error) {
    console.error('ERRORE - Salvataggio appuntamento principale:', error);
    throw error;
  }
  
  // Save additional appointments for same day with conflict check
  for (let i = 0; i < additionalAppointments.length; i++) {
    const additionalAppointment = additionalAppointments[i];
    try {
      const hasConflict = await checkTimeConflicts(additionalAppointment, existingAppointments);
      if (hasConflict) {
        console.warn(`DEBUG - ⚠️ Conflitto rilevato per evento aggiuntivo ${i + 1}`);
        toast.warning(`Attenzione: possibile conflitto per evento aggiuntivo alle ${additionalAppointment.time}`);
      }
      
      await addAppointment(additionalAppointment);
      console.log(`DEBUG - ✅ Appuntamento aggiuntivo ${i + 1}/${additionalAppointments.length} salvato per stesso giorno`);
    } catch (error) {
      console.error(`ERRORE - Salvataggio appuntamento aggiuntivo ${i + 1}:`, error);
      failedSaves.push(`Evento aggiuntivo ${i + 1}`);
      // Continua con gli altri invece di interrompere
    }
  }

  // Save recurring appointments with improved error handling
  console.log(`DEBUG - 📱 Processamento di ${recurringAppointments.length} appuntamenti ricorrenti`);
  
  for (let i = 0; i < recurringAppointments.length; i++) {
    const recurringAppointment = recurringAppointments[i];
    
    try {
      console.log(`DEBUG - 💾 Salvando appuntamento ricorrente ${i + 1}/${recurringAppointments.length} per data:`, recurringAppointment.date);
      
      // Verifica conflitti per appuntamenti ricorrenti
      const hasConflict = await checkTimeConflicts(recurringAppointment, existingAppointments);
      if (hasConflict) {
        console.warn(`DEBUG - ⚠️ Conflitto rilevato per appuntamento ricorrente ${i + 1}`);
        toast.warning(`Conflitto rilevato per ${recurringAppointment.client} il ${recurringAppointment.date} alle ${recurringAppointment.time}`);
      }
      
      await addAppointment(recurringAppointment);
      savedRecurringCount++;
      
      console.log(`DEBUG - ✅ Appuntamento ricorrente ${i + 1} salvato! Progresso: ${savedRecurringCount}/${recurringAppointments.length}`);
      
      // Pausa solo su mobile e solo se necessario
      if (isMobile && i < recurringAppointments.length - 1 && i % 3 === 2) {
        await new Promise(resolve => setTimeout(resolve, 150));
        console.log(`DEBUG - ⏱️ Pausa di 150ms dopo ${i + 1} salvataggi`);
      }
      
    } catch (error) {
      console.error(`❌ Errore salvando appuntamento ricorrente ${i + 1} per ${recurringAppointment.date}:`, error);
      failedSaves.push(`Ricorrente ${i + 1} (${recurringAppointment.date})`);
      // IMPORTANTE: Continua con il prossimo invece di interrompere
      continue;
    }
  }
  
  console.log('DEBUG - 🏁 Salvataggio completato:', {
    savedRecurringCount,
    totalRequested: recurringAppointments.length,
    failedSaves: failedSaves.length,
    successRate: `${Math.round((savedRecurringCount / recurringAppointments.length) * 100)}%`
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
