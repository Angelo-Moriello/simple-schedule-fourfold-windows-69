
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
}

export const useAppointmentSubmission = ({
  appointmentToEdit,
  date,
  addAppointment,
  updateAppointment,
  onClose
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
    console.log('DEBUG - 🚀 Submit iniziato con:', {
      formData: formData,
      multipleEvents: multipleEvents.length,
      selectedDates: selectedDates.length,
      selectedDatesDetails: selectedDates.map(d => format(d, 'yyyy-MM-dd')),
      userAgent: navigator.userAgent,
      isMobile: /Mobi|Android/i.test(navigator.userAgent)
    });
    
    if (!validateAppointmentForm(formData, multipleEvents)) {
      console.log('DEBUG - ❌ Validazione fallita');
      return;
    }

    try {
      const finalClientId = await handleClientCreation(formData);
      console.log('DEBUG - ✅ Cliente preparato:', finalClientId);

      // Create main appointment
      const mainAppointment = createAppointmentFromData(
        formData,
        finalClientId,
        format(date, 'yyyy-MM-dd'),
        appointmentToEdit?.id
      );

      console.log('DEBUG - ✅ Appuntamento principale creato:', mainAppointment);

      // Create additional appointments for multiple events on the same day
      const additionalAppointments = createAdditionalAppointments(
        formData,
        finalClientId,
        format(date, 'yyyy-MM-dd'),
        multipleEvents
      );

      console.log('DEBUG - ✅ Appuntamenti aggiuntivi per stesso giorno preparati:', additionalAppointments.length);

      // Create recurring appointments for each selected date
      console.log('DEBUG - 📅 Preparazione appuntamenti ricorrenti per date:', selectedDates.map(d => format(d, 'yyyy-MM-dd')));
      
      const recurringAppointments = createRecurringAppointments(
        formData,
        finalClientId,
        selectedDates,
        multipleEvents
      );

      console.log('DEBUG - ✅ Appuntamenti ricorrenti preparati:', {
        total: recurringAppointments.length,
        dates: selectedDates.length,
        eventsPerDate: multipleEvents.length + 1
      });

      if (appointmentToEdit && updateAppointment) {
        await updateAppointment(mainAppointment);
        toast.success('Appuntamento modificato con successo!');
        console.log('DEBUG - ✅ Appuntamento modificato');
      } else if (addAppointment) {
        console.log('DEBUG - 💾 Inizio processo di salvataggio...');
        
        const { savedRecurringCount } = await saveAppointments(
          mainAppointment,
          additionalAppointments,
          recurringAppointments,
          addAppointment
        );
        
        const totalMainEvents = 1 + additionalAppointments.length;
        const successMessage = generateSuccessMessage(
          totalMainEvents,
          savedRecurringCount,
          selectedDates.length
        );
        
        console.log('DEBUG - ✅ Operazione completata:', {
          mainEvents: totalMainEvents,
          recurringEvents: savedRecurringCount,
          totalRecurringDates: selectedDates.length,
          expectedRecurringEvents: recurringAppointments.length,
          success: savedRecurringCount === recurringAppointments.length
        });
        
        if (savedRecurringCount < recurringAppointments.length) {
          console.warn('DEBUG - ⚠️ Non tutti gli appuntamenti ricorrenti sono stati salvati');
          toast.warning(`${successMessage} Attenzione: alcuni appuntamenti ricorrenti potrebbero non essere stati salvati correttamente.`);
        } else {
          toast.success(successMessage);
        }
      }

      // Aggiungi un piccolo delay prima di chiudere per permettere il completamento su mobile
      setTimeout(() => {
        onClose();
      }, 100);
      
    } catch (error) {
      console.error('❌ ERRORE nell\'operazione:', error);
      toast.error('Errore nell\'operazione: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  };

  return {
    submitAppointment
  };
};
