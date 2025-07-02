
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
      const { savedRecurringCount, failedSaves } = await saveAppointments(
        mainAppointment,
        additionalAppointments,
        recurringAppointments,
        addAppointment,
        existingAppointments
      );
      
      const totalMainEvents = 1 + additionalAppointments.length;
      const successMessage = generateSuccessMessage(
        totalMainEvents,
        savedRecurringCount,
        recurringAppointments.length,
        failedSaves
      );
      
      console.log('🏆 AppointmentSaving - RISULTATO FINALE:', {
        mainEvents: totalMainEvents,
        recurringEvents: savedRecurringCount,
        totalRecurringExpected: recurringAppointments.length,
        failedSaves: failedSaves.length,
        successRate: recurringAppointments.length > 0 ? `${Math.round((savedRecurringCount / recurringAppointments.length) * 100)}%` : '100%',
        successMessage
      });
      
      // Mostra il messaggio appropriato
      if (savedRecurringCount === recurringAppointments.length && failedSaves.length === 0) {
        toast.success(successMessage);
      } else if (savedRecurringCount > 0 || failedSaves.length === 0) {
        toast.success(successMessage);
      } else {
        toast.error(`Errore nel salvare alcuni appuntamenti: ${failedSaves.length} falliti`);
      }
      
    } catch (error) {
      console.error('❌ Errore critico nel processo di salvataggio:', error);
      toast.error('Errore nel salvare gli appuntamenti');
    }
  };

  return { handleSaveAppointments };
};
