
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

  // Save all recurring appointments with batch processing for mobile
  let savedRecurringCount = 0;
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const batchSize = isMobile ? 3 : 5; // Smaller batches on mobile
  
  console.log(`DEBUG - 📱 Processamento ${recurringAppointments.length} appuntamenti ricorrenti in batch di ${batchSize}`);
  
  for (let i = 0; i < recurringAppointments.length; i += batchSize) {
    const batch = recurringAppointments.slice(i, i + batchSize);
    console.log(`DEBUG - 📦 Processando batch ${Math.floor(i/batchSize) + 1}: ${batch.length} appuntamenti`);
    
    // Process each appointment in the batch
    for (const recurringAppointment of batch) {
      try {
        console.log(`DEBUG - 💾 Salvando appuntamento per data:`, recurringAppointment.date);
        
        await addAppointment(recurringAppointment);
        savedRecurringCount++;
        
        console.log(`DEBUG - ✅ Salvato con successo! Totale salvati: ${savedRecurringCount}/${recurringAppointments.length}`);
        
      } catch (error) {
        console.error(`❌ Errore salvando appuntamento per ${recurringAppointment.date}:`, error);
        // Continue with next appointment instead of failing completely
      }
    }
    
    // Small delay only between batches on mobile to prevent overwhelming the system
    if (isMobile && i + batchSize < recurringAppointments.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
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
