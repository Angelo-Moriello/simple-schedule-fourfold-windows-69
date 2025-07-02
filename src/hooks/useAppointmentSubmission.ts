
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { validateAppointmentForm } from '@/utils/appointment/appointmentValidation';
import { useClientHandling } from './appointment-submission/useClientHandling';
import { useAppointmentCreation } from './appointment-submission/useAppointmentCreation';
import { useAppointmentSaving } from './appointment-submission/useAppointmentSaving';

interface MultipleEvent {
  id: string;
  employeeId: string;
  time: string;
  serviceType: string;
  title: string;
  duration: string;
  notes: string;
}

interface UseAppointmentSubmissionProps {
  appointmentToEdit: Appointment | null;
  date: Date;
  addAppointment?: (appointment: Appointment) => void;
  updateAppointment?: (appointment: Appointment) => void;
  onClose: () => void;
  existingAppointments?: Appointment[];
}

export const useAppointmentSubmission = ({
  appointmentToEdit,
  date,
  addAppointment,
  updateAppointment,
  onClose,
  existingAppointments = []
}: UseAppointmentSubmissionProps) => {
  const { handleClientCreation } = useClientHandling();
  const { createAppointments } = useAppointmentCreation();
  const { handleSaveAppointments } = useAppointmentSaving();

  const submitAppointment = async (
    formData: any,
    multipleEvents: MultipleEvent[],
    selectedDates: Date[]
  ) => {
    console.log('🚀 useAppointmentSubmission - INIZIO SUBMIT:', {
      formData: {
        client: formData.client,
        time: formData.time,
        employeeId: formData.employeeId
      },
      multipleEvents: multipleEvents.length,
      selectedDates: selectedDates?.length || 0,
      selectedDatesDetails: selectedDates?.map(d => format(d, 'yyyy-MM-dd')) || [],
      mainDate: format(date, 'yyyy-MM-dd'),
      existingAppointments: existingAppointments.length,
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
      dataTypes: {
        selectedDates: typeof selectedDates,
        isArray: Array.isArray(selectedDates),
        formData: typeof formData,
        multipleEvents: typeof multipleEvents
      }
    });
    
    // Validazione dati di input
    if (!selectedDates) {
      console.log('⚠️ useAppointmentSubmission - selectedDates è null/undefined, inizializzazione array vuoto');
      selectedDates = [];
    }
    
    if (!Array.isArray(selectedDates)) {
      console.error('❌ useAppointmentSubmission - selectedDates non è un array!', {
        selectedDates,
        type: typeof selectedDates
      });
      selectedDates = [];
    }
    
    if (!validateAppointmentForm(formData, multipleEvents)) {
      console.log('❌ useAppointmentSubmission - Validazione fallita');
      return;
    }

    try {
      const finalClientId = await handleClientCreation(formData, appointmentToEdit);
      console.log('✅ useAppointmentSubmission - Cliente preparato:', finalClientId);

      const { mainAppointment, additionalAppointments, recurringAppointments } = createAppointments(
        formData,
        finalClientId,
        date,
        multipleEvents,
        selectedDates,
        appointmentToEdit
      );

      if (appointmentToEdit && updateAppointment) {
        await updateAppointment(mainAppointment);
        toast.success('Appuntamento modificato con successo!');
        console.log('✅ useAppointmentSubmission - Appuntamento modificato');
      } else {
        await handleSaveAppointments(
          mainAppointment,
          additionalAppointments,
          recurringAppointments,
          addAppointment,
          existingAppointments
        );
      }

      // Close form after successful operation
      onClose();
      
    } catch (error) {
      console.error('❌ useAppointmentSubmission - ERRORE nell\'operazione:', error);
      toast.error('Errore nell\'operazione: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  };

  return {
    submitAppointment
  };
};
