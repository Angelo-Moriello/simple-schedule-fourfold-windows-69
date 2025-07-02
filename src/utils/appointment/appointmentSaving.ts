
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';

export const saveAppointments = async (
  mainAppointment: Appointment,
  additionalAppointments: Appointment[],
  recurringAppointments: Appointment[],
  addAppointment: (appointment: Appointment) => void
) => {
  console.log('DEBUG - 🚀 Inizio salvataggio appuntamenti:', {
    mainAppointment: mainAppointment,
    additionalCount: additionalAppointments.length,
    recurringCount: recurringAppointments.length,
    isMobile: /Mobi|Android/i.test(navigator.userAgent)
  });

  // Save main appointment
  try {
    await addAppointment(mainAppointment);
    console.log('DEBUG - ✅ Appuntamento principale salvato con successo');
  } catch (error) {
    console.error('ERRORE - Salvataggio appuntamento principale:', error);
    throw error;
  }
  
  // Save additional appointments for same day
  for (let i = 0; i < additionalAppointments.length; i++) {
    const additionalAppointment = additionalAppointments[i];
    try {
      await addAppointment(additionalAppointment);
      console.log(`DEBUG - ✅ Appuntamento aggiuntivo ${i + 1}/${additionalAppointments.length} salvato per stesso giorno`);
    } catch (error) {
      console.error(`ERRORE - Salvataggio appuntamento aggiuntivo ${i + 1}:`, error);
      throw error;
    }
  }

  // Save recurring appointments with sequential processing for reliability
  let savedRecurringCount = 0;
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  
  console.log(`DEBUG - 📱 Processamento sequenziale di ${recurringAppointments.length} appuntamenti ricorrenti su mobile: ${isMobile}`);
  
  // Process appointments one by one with delays for mobile reliability
  for (let i = 0; i < recurringAppointments.length; i++) {
    const recurringAppointment = recurringAppointments[i];
    
    try {
      console.log(`DEBUG - 💾 Salvando appuntamento ${i + 1}/${recurringAppointments.length} per data:`, recurringAppointment.date);
      
      await addAppointment(recurringAppointment);
      savedRecurringCount++;
      
      console.log(`DEBUG - ✅ Salvato con successo! Progresso: ${savedRecurringCount}/${recurringAppointments.length}`);
      
      // Add delay between saves on mobile to prevent overwhelming the system
      if (isMobile && i < recurringAppointments.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log(`DEBUG - ⏱️ Pausa di 200ms completata prima del prossimo salvataggio`);
      }
      
    } catch (error) {
      console.error(`❌ Errore salvando appuntamento ${i + 1} per ${recurringAppointment.date}:`, error);
      // Continue with next appointment but log the failure
    }
  }
  
  console.log('DEBUG - 🏁 Salvataggio completato:', {
    savedRecurringCount,
    totalRequested: recurringAppointments.length,
    successRate: `${Math.round((savedRecurringCount / recurringAppointments.length) * 100)}%`
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
    const uniqueRecurringDates = Math.floor(savedRecurringCount / totalMainEvents);
    successMessage += ` Inoltre ${savedRecurringCount} appuntament${savedRecurringCount > 1 ? 'i ricorrenti creati' : 'o ricorrente creato'} per ${uniqueRecurringDates} date selezionate.`;
  }
  
  console.log('DEBUG - 📝 Messaggio di successo generato:', successMessage);
  return successMessage;
};
