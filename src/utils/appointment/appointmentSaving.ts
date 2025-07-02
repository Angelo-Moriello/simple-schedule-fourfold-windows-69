
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';

export const saveAppointments = async (
  mainAppointment: Appointment,
  additionalAppointments: Appointment[],
  recurringAppointments: Appointment[],
  addAppointment: (appointment: Appointment) => void
) => {
  console.log('DEBUG - Inizio salvataggio appuntamenti:', {
    mainAppointment: mainAppointment,
    additionalCount: additionalAppointments.length,
    recurringCount: recurringAppointments.length
  });

  // Save main appointment
  try {
    await addAppointment(mainAppointment);
    console.log('DEBUG - Appuntamento principale salvato con successo');
  } catch (error) {
    console.error('ERRORE - Salvataggio appuntamento principale:', error);
    throw error;
  }
  
  // Save additional appointments for same day
  for (let i = 0; i < additionalAppointments.length; i++) {
    const additionalAppointment = additionalAppointments[i];
    try {
      await addAppointment(additionalAppointment);
      console.log(`DEBUG - Appuntamento aggiuntivo ${i + 1}/${additionalAppointments.length} salvato per stesso giorno`);
    } catch (error) {
      console.error(`ERRORE - Salvataggio appuntamento aggiuntivo ${i + 1}:`, error);
      throw error;
    }
  }

  // Save all recurring appointments one by one with better error handling
  let savedRecurringCount = 0;
  console.log(`DEBUG - Inizio salvataggio ${recurringAppointments.length} appuntamenti ricorrenti`);
  
  for (let i = 0; i < recurringAppointments.length; i++) {
    const recurringAppointment = recurringAppointments[i];
    try {
      console.log(`DEBUG - Tentativo salvataggio appuntamento ricorrente ${i + 1}/${recurringAppointments.length}:`, {
        date: recurringAppointment.date,
        time: recurringAppointment.time,
        client: recurringAppointment.client,
        serviceType: recurringAppointment.serviceType
      });
      
      await addAppointment(recurringAppointment);
      savedRecurringCount++;
      console.log(`DEBUG - ✅ Appuntamento ricorrente ${i + 1}/${recurringAppointments.length} salvato con successo per data:`, recurringAppointment.date);
      
      // Aggiungi un piccolo delay per evitare problemi di concorrenza su mobile
      if (i < recurringAppointments.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error(`❌ ERRORE - Salvataggio appuntamento ricorrente ${i + 1}/${recurringAppointments.length} per data ${recurringAppointment.date}:`, error);
      // Non interrompere il processo, continua con gli altri
    }
  }
  
  console.log('DEBUG - Salvataggio completato:', {
    savedRecurringCount,
    totalRequested: recurringAppointments.length,
    success: savedRecurringCount === recurringAppointments.length
  });
  
  return { savedRecurringCount };
};

export const generateSuccessMessage = (
  totalMainEvents: number,
  savedRecurringCount: number,
  selectedDatesCount: number
): string => {
  let successMessage = `${totalMainEvents} appuntament${totalMainEvents > 1 ? 'i creati' : 'o creato'} con successo!`;
  
  if (savedRecurringCount > 0) {
    const uniqueRecurringDates = Math.floor(savedRecurringCount / (totalMainEvents));
    successMessage += ` Inoltre ${savedRecurringCount} appuntament${savedRecurringCount > 1 ? 'i ricorrenti creati' : 'o ricorrente creato'} per ${uniqueRecurringDates} date selezionate.`;
  }
  
  console.log('DEBUG - Messaggio di successo generato:', successMessage);
  return successMessage;
};
