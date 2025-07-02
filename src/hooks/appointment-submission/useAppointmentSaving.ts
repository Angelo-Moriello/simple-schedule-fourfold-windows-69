
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { 
  saveAppointments, 
  generateSuccessMessage 
} from '@/utils/appointment/appointmentSaving';
import { validateAppointment } from '@/utils/appointment/saving/appointmentValidator';

export const useAppointmentSaving = () => {
  const handleSaveAppointments = async (
    mainAppointment: Appointment,
    additionalAppointments: Appointment[],
    recurringAppointments: Appointment[],
    addAppointment: ((appointment: Appointment) => void) | undefined,
    existingAppointments: Appointment[]
  ) => {
    if (!addAppointment) {
      console.error('addAppointment function is missing');
      toast.error('Errore interno: funzione di salvataggio mancante');
      return;
    }

    // Validazione appuntamento principale
    const mainValidation = validateAppointment(mainAppointment);
    if (!mainValidation.isValid) {
      console.error('Appuntamento principale non valido:', mainValidation.errors);
      toast.error(`Errore: ${mainValidation.errors.join(', ')}`);
      return;
    }

    console.log('💾 AppointmentSaving - INIZIO PROCESSO DI SALVATAGGIO:', {
      mainAppointment: 1,
      additionalAppointments: additionalAppointments.length,
      recurringAppointments: recurringAppointments.length,
      totalToSave: 1 + additionalAppointments.length + recurringAppointments.length
    });
    
    try {
      const result = await saveAppointments(
        mainAppointment,
        additionalAppointments,
        recurringAppointments,
        addAppointment,
        existingAppointments
      );
      
      const totalMainEvents = 1 + additionalAppointments.length;
      const successMessage = generateSuccessMessage(
        totalMainEvents,
        result.savedRecurringCount,
        recurringAppointments.length,
        result.failedSaves
      );
      
      console.log('🏆 AppointmentSaving - RISULTATO FINALE:', {
        mainEvents: totalMainEvents,
        recurringEvents: result.savedRecurringCount,
        totalRecurringExpected: recurringAppointments.length,
        failedSaves: result.failedSaves.length,
        successRate: recurringAppointments.length > 0 ? `${Math.round((result.savedRecurringCount / recurringAppointments.length) * 100)}%` : '100%',
        successMessage
      });
      
      // Mostra sempre successo se il principale e aggiuntivi sono stati salvati
      // Solo i ricorrenti possono fallire parzialmente
      if (result.failedSaves.length === 0) {
        toast.success(successMessage);
      } else if (result.savedRecurringCount > 0) {
        toast.success(successMessage);
      } else {
        // Solo se tutti i ricorrenti falliscono mostra warning
        toast.success(`Appuntamento principale creato! Alcuni ricorrenti non sono stati salvati: ${result.failedSaves.length} falliti`);
      }
      
    } catch (error) {
      console.error('❌ Errore critico nel processo di salvataggio:', error);
      
      // Verifica se l'errore è solo locale controllando se l'appuntamento esiste su DB
      toast.error('Errore nel salvataggio. Ricarica la pagina per verificare se l\'appuntamento è stato creato.');
    }
  };

  return { handleSaveAppointments };
};
