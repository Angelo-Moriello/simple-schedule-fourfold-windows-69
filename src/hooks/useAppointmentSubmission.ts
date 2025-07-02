
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { useClientOperations } from './useClientOperations';
import { validateAppointmentForm } from '@/utils/appointment/appointmentValidation';
import { 
  createAppointmentFromData, 
  createAdditionalAppointments, 
  createRecurringAppointments 
} from '@/utils/appointment/appointmentCreation';
import { 
  saveAppointments, 
  generateSuccessMessage 
} from '@/utils/appointment/appointmentSaving';

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
  const { findExistingClient, createNewClient } = useClientOperations();

  const handleClientCreation = async (formData: any) => {
    let finalClientId = formData.clientId;
    
    // Handle client creation/finding logic
    if (!appointmentToEdit && !finalClientId) {
      console.log('DEBUG - Tentativo di trovare o creare cliente:', {
        name: formData.client,
        email: formData.email,
        phone: formData.phone
      });
      
      const existingClient = await findExistingClient(
        formData.client.trim(),
        formData.email?.trim(),
        formData.phone?.trim()
      );
      
      if (existingClient) {
        console.log('DEBUG - Cliente esistente trovato:', existingClient);
        finalClientId = existingClient.id;
      } else {
        const newClient = await createNewClient({
          name: formData.client,
          email: formData.email,
          phone: formData.phone
        });
        finalClientId = newClient.id;
        toast.success('Nuovo cliente creato con successo');
      }
    }

    return finalClientId;
  };

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
      const finalClientId = await handleClientCreation(formData);
      console.log('✅ useAppointmentSubmission - Cliente preparato:', finalClientId);

      // Create main appointment
      const mainAppointment = createAppointmentFromData(
        formData,
        finalClientId,
        format(date, 'yyyy-MM-dd'),
        appointmentToEdit?.id
      );

      console.log('✅ useAppointmentSubmission - Appuntamento principale creato per:', format(date, 'yyyy-MM-dd'));

      // Create additional appointments for multiple events on the same day
      const additionalAppointments = createAdditionalAppointments(
        formData,
        finalClientId,
        format(date, 'yyyy-MM-dd'),
        multipleEvents
      );

      console.log('✅ useAppointmentSubmission - Appuntamenti aggiuntivi preparati:', additionalAppointments.length);

      // Create recurring appointments for each selected date (ESCLUSA la data principale)
      console.log('📅 useAppointmentSubmission - PREPARAZIONE RICORRENTI con date:', {
        selectedDatesInput: selectedDates.map(d => format(d, 'yyyy-MM-dd')),
        selectedDatesCount: selectedDates.length,
        mainDateToExclude: format(date, 'yyyy-MM-dd'),
        multipleEventsCount: multipleEvents.length
      });
      
      const recurringAppointments = createRecurringAppointments(
        formData,
        finalClientId,
        selectedDates,
        multipleEvents,
        date // Passa la data principale per escluderla
      );

      console.log('✅ useAppointmentSubmission - APPUNTAMENTI RICORRENTI PREPARATI:', {
        total: recurringAppointments.length,
        originalSelectedDates: selectedDates.length,
        excludedMainDate: format(date, 'yyyy-MM-dd'),
        processedDates: selectedDates.filter(d => format(d, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')).length,
        eventsPerDate: multipleEvents.length + 1,
        dettagli: recurringAppointments.map(app => ({ 
          date: app.date, 
          time: app.time, 
          service: app.serviceType,
          client: app.client 
        }))
      });

      if (appointmentToEdit && updateAppointment) {
        await updateAppointment(mainAppointment);
        toast.success('Appuntamento modificato con successo!');
        console.log('✅ useAppointmentSubmission - Appuntamento modificato');
      } else if (addAppointment) {
        console.log('💾 useAppointmentSubmission - INIZIO PROCESSO DI SALVATAGGIO:', {
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
        
        console.log('🏆 useAppointmentSubmission - RISULTATO FINALE:', {
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
