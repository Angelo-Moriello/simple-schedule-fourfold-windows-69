
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { 
  saveAppointments, 
  generateSuccessMessage 
} from '@/utils/appointment/appointmentSaving';

export const useAppointmentSaving = () => {
  const handleSaveAppointments = async (
    mainAppointment: Appointment,
    additionalAppointments: Appointment[],
    recurringAppointments: Appointment[],
    addAppointment: ((appointment: Appointment) => void) | undefined,
    existingAppointments: Appointment[]
  ) => {
    if (!addAppointment) return;

    console.log('💾 AppointmentSaving - INIZIO PROCESSO DI SALVATAGGIO:', {
      mainAppointment: 1,
      additionalAppointments: additionalAppointments.length,
      recurringAppointments: recurringAppointments.length,
      totalToSave: 1 + additionalAppointments.length + recurringAppointments.length
    });
    
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
    
    // Show appropriate message based on results
    if (savedRecurringCount === recurringAppointments.length && failedSaves.length === 0) {
      toast.success(successMessage);
    } else if (savedRecurringCount > 0) {
      toast.warning(successMessage);
    } else if (recurringAppointments.length > 0) {
      toast.error(`Appuntamento principale creato, ma ${failedSaves.length} appuntamenti ricorrenti non sono stati salvati.`);
    } else {
      toast.success(successMessage);
    }
  };

  return { handleSaveAppointments };
};
