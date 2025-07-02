
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { generateUUID } from '@/utils/appointmentFormUtils';
import { useClientOperations } from './useClientOperations';

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

  const validateForm = (formData: any, multipleEvents: MultipleEvent[]) => {
    if (!formData.client.trim()) {
      toast.error('Il nome del cliente è obbligatorio');
      return false;
    }

    if (!formData.serviceType.trim()) {
      toast.error('Il tipo di servizio è obbligatorio');
      return false;
    }

    // Validate multiple events
    for (const event of multipleEvents) {
      if (!event.serviceType.trim()) {
        toast.error('Tutti gli eventi aggiuntivi devono avere un tipo di servizio');
        return false;
      }
      if (!event.time.trim()) {
        toast.error('Tutti gli eventi aggiuntivi devono avere un orario');
        return false;
      }
    }

    return true;
  };

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

  const createAppointment = (
    formData: any,
    clientId: string,
    dateStr: string,
    appointmentId?: string
  ): Appointment => {
    return {
      id: appointmentId || generateUUID(),
      employeeId: parseInt(formData.employeeId),
      date: dateStr,
      time: formData.time,
      title: formData.title.trim(),
      client: formData.client.trim(),
      duration: parseInt(formData.duration),
      notes: formData.notes.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      color: formData.color,
      serviceType: formData.serviceType,
      clientId: clientId
    };
  };

  const submitAppointment = async (
    formData: any,
    multipleEvents: MultipleEvent[],
    selectedDates: Date[]
  ) => {
    console.log('DEBUG - Submit iniziato con:', {
      formData: formData,
      multipleEvents: multipleEvents.length,
      selectedDates: selectedDates.length,
      selectedDatesDetails: selectedDates.map(d => format(d, 'yyyy-MM-dd'))
    });
    
    if (!validateForm(formData, multipleEvents)) {
      return;
    }

    try {
      const finalClientId = await handleClientCreation(formData);

      // Create main appointment
      const mainAppointment = createAppointment(
        formData,
        finalClientId,
        format(date, 'yyyy-MM-dd'),
        appointmentToEdit?.id
      );

      console.log('DEBUG - Appuntamento principale creato:', mainAppointment);

      // Create additional appointments for multiple events on the same day
      const additionalAppointments: Appointment[] = multipleEvents.map(event => 
        createAppointment(
          { ...formData, employeeId: event.employeeId, time: event.time, duration: event.duration, serviceType: event.serviceType, title: event.title, notes: event.notes },
          finalClientId,
          format(date, 'yyyy-MM-dd')
        )
      );

      console.log('DEBUG - Appuntamenti aggiuntivi per stesso giorno:', additionalAppointments.length);

      // Create recurring appointments for each selected date
      const recurringAppointments: Appointment[] = [];
      
      console.log('DEBUG - Inizio processamento date ricorrenti, totale date:', selectedDates.length);
      
      for (let i = 0; i < selectedDates.length; i++) {
        const selectedDate = selectedDates[i];
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        console.log(`DEBUG - Processando data ricorrente ${i + 1}/${selectedDates.length}:`, dateStr);
        
        // Main appointment for this recurring date
        const recurringMainAppointment = createAppointment(
          formData,
          finalClientId,
          dateStr
        );
        recurringAppointments.push(recurringMainAppointment);
        console.log('DEBUG - Appuntamento ricorrente principale aggiunto per:', dateStr);

        // Additional events for this recurring date
        for (let j = 0; j < multipleEvents.length; j++) {
          const event = multipleEvents[j];
          const recurringAdditionalAppointment = createAppointment(
            { ...formData, employeeId: event.employeeId, time: event.time, duration: event.duration, serviceType: event.serviceType, title: event.title, notes: event.notes },
            finalClientId,
            dateStr
          );
          recurringAppointments.push(recurringAdditionalAppointment);
          console.log(`DEBUG - Appuntamento ricorrente aggiuntivo ${j + 1} aggiunto per:`, dateStr);
        }
      }

      console.log('DEBUG - Totale appuntamenti ricorrenti da salvare:', recurringAppointments.length);

      if (appointmentToEdit && updateAppointment) {
        await updateAppointment(mainAppointment);
        toast.success('Appuntamento modificato con successo!');
      } else if (addAppointment) {
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
        
        const totalMainEvents = 1 + additionalAppointments.length;
        
        let successMessage = `${totalMainEvents} appuntament${totalMainEvents > 1 ? 'i creati' : 'o creato'} con successo!`;
        if (savedRecurringCount > 0) {
          const uniqueRecurringDates = [...new Set(recurringAppointments.map(apt => apt.date))].length;
          successMessage += ` Inoltre ${savedRecurringCount} appuntament${savedRecurringCount > 1 ? 'i ricorrenti creati' : 'o ricorrente creato'} per ${uniqueRecurringDates} date selezionate.`;
        }
        
        console.log('DEBUG - Operazione completata:', {
          mainEvents: totalMainEvents,
          recurringEvents: savedRecurringCount,
          totalRecurringDates: selectedDates.length
        });
        
        toast.success(successMessage);
      }

      onClose();
    } catch (error) {
      console.error('Errore nell\'operazione:', error);
      toast.error('Errore nell\'operazione');
    }
  };

  return {
    submitAppointment
  };
};
