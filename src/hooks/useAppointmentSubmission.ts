
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { validateAppointmentForm } from '@/utils/appointment/appointmentValidation';
import { useClientHandling } from './appointment-submission/useClientHandling';
import { useAppointmentCreation } from './appointment-submission/useAppointmentCreation';
import { useAppointmentSaving } from './appointment-submission/useAppointmentSaving';

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
    multipleEvents: Appointment[],
    selectedDates: Date[]
  ) => {
    console.log('🚀 SUBMIT - DATI RICEVUTI IN DETTAGLIO:', {
      formData: {
        client: formData.client,
        time: formData.time,
        employeeId: formData.employeeId
      },
      multipleEvents: multipleEvents.length,
      selectedDatesRAW: selectedDates,
      selectedDatesFormatted: selectedDates?.map(d => format(d, 'yyyy-MM-dd HH:mm:ss')) || [],
      selectedDatesCount: selectedDates?.length || 0,
      selectedDatesType: typeof selectedDates,
      selectedDatesIsArray: Array.isArray(selectedDates),
      mainDate: format(date, 'yyyy-MM-dd'),
      isMobile: /Mobi|Android/i.test(navigator.userAgent)
    });
    
    // Validazione e pulizia selectedDates
    if (!selectedDates || !Array.isArray(selectedDates)) {
      console.log('⚠️ selectedDates non valido, inizializzazione array vuoto');
      selectedDates = [];
    } else {
      console.log('✅ selectedDates valido:', selectedDates.map(d => format(d, 'yyyy-MM-dd')));
    }
    
    if (!validateAppointmentForm(formData, multipleEvents)) {
      console.log('❌ Validazione fallita');
      return;
    }

    try {
      const finalClientId = await handleClientCreation(formData, appointmentToEdit);
      console.log('✅ Cliente preparato:', finalClientId);

      const { mainAppointment, additionalAppointments, recurringAppointments } = createAppointments(
        formData,
        finalClientId,
        date,
        multipleEvents,
        selectedDates,
        appointmentToEdit
      );

      console.log('🎯 APPUNTAMENTI CREATI - RIEPILOGO FINALE:', {
        mainAppointment: 1,
        additionalAppointments: additionalAppointments.length,
        recurringAppointments: recurringAppointments.length,
        totalToSave: 1 + additionalAppointments.length + recurringAppointments.length
      });

      if (appointmentToEdit && updateAppointment) {
        await updateAppointment(mainAppointment);
        toast.success('Appuntamento modificato con successo!');
        console.log('✅ Appuntamento modificato');
      } else {
        await handleSaveAppointments(
          mainAppointment,
          additionalAppointments,
          recurringAppointments,
          addAppointment,
          existingAppointments
        );
      }

      onClose();
      
    } catch (error) {
      console.error('❌ ERRORE nell\'operazione:', error);
      toast.error('Errore nell\'operazione: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  };

  return {
    submitAppointment
  };
};
