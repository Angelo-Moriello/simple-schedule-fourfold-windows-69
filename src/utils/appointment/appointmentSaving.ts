
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';

export const saveAppointments = async (
  mainAppointment: Appointment,
  additionalAppointments: Appointment[],
  recurringAppointments: Appointment[],
  addAppointment: (appointment: Appointment) => void
) => {
  // Save main appointment
  await addAppointment(mainAppointment);
  console.log('DEBUG - Appuntamento principale salvato');
  
  // Save additional appointments for same day
  for (let i = 0; i < additionalAppointments.length; i++) {
    const additionalAppointment = additionalAppointments[i];
    await addAppointment(additionalAppointment);
    console.log(`DEBUG - Appuntamento aggiuntivo ${i + 1} salvato per stesso giorno`);
  }

  // Save all recurring appointments one by one
  let savedRecurringCount = 0;
  for (let i = 0; i < recurringAppointments.length; i++) {
    const recurringAppointment = recurringAppointments[i];
    try {
      await addAppointment(recurringAppointment);
      savedRecurringCount++;
      console.log(`DEBUG - Appuntamento ricorrente ${i + 1}/${recurringAppointments.length} salvato per data:`, recurringAppointment.date);
    } catch (error) {
      console.error(`Errore salvando appuntamento ricorrente ${i + 1}:`, recurringAppointment.date, error);
    }
  }
  
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
  
  return successMessage;
};
