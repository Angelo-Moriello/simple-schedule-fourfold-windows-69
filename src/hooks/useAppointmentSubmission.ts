
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
    console.log('DEBUG - Submit con formData:', formData);
    console.log('DEBUG - Submit con eventi multipli:', multipleEvents);
    console.log('DEBUG - Submit con date multiple:', selectedDates);
    
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

      console.log('DEBUG - Salvataggio appuntamento principale:', mainAppointment);

      // Create additional appointments for multiple events
      const additionalAppointments: Appointment[] = multipleEvents.map(event => 
        createAppointment(
          { ...formData, employeeId: event.employeeId, time: event.time, duration: event.duration, serviceType: event.serviceType, title: event.title, notes: event.notes },
          finalClientId,
          format(date, 'yyyy-MM-dd')
        )
      );

      // Create recurring appointments for selected dates
      const recurringAppointments: Appointment[] = selectedDates.flatMap(selectedDate => {
        const baseRecurringAppointment = createAppointment(
          formData,
          finalClientId,
          format(selectedDate, 'yyyy-MM-dd')
        );

        const appointments = [baseRecurringAppointment];

        // Include additional events on each selected date
        multipleEvents.forEach(event => {
          appointments.push(createAppointment(
            { ...formData, employeeId: event.employeeId, time: event.time, duration: event.duration, serviceType: event.serviceType, title: event.title, notes: event.notes },
            finalClientId,
            format(selectedDate, 'yyyy-MM-dd')
          ));
        });

        return appointments;
      });

      console.log('DEBUG - Salvataggio appuntamenti aggiuntivi:', additionalAppointments);
      console.log('DEBUG - Salvataggio appuntamenti ricorrenti:', recurringAppointments);

      if (appointmentToEdit && updateAppointment) {
        await updateAppointment(mainAppointment);
        toast.success('Appuntamento modificato con successo!');
      } else if (addAppointment) {
        // Save main appointment
        await addAppointment(mainAppointment);
        
        // Save additional appointments for same day
        for (const additionalAppointment of additionalAppointments) {
          await addAppointment(additionalAppointment);
        }

        // Save recurring appointments for selected dates
        for (const recurringAppointment of recurringAppointments) {
          await addAppointment(recurringAppointment);
        }
        
        const totalMainEvents = 1 + additionalAppointments.length;
        const totalRecurringEvents = recurringAppointments.length;
        
        let successMessage = `${totalMainEvents} appuntament${totalMainEvents > 1 ? 'i creati' : 'o creato'} con successo!`;
        if (totalRecurringEvents > 0) {
          successMessage += ` Inoltre ${totalRecurringEvents} appuntament${totalRecurringEvents > 1 ? 'i ricorrenti creati' : 'o ricorrente creato'} per le date selezionate.`;
        }
        
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
