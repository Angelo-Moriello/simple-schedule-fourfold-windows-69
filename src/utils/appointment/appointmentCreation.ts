
import { Appointment } from '@/types/appointment';
import { generateUUID } from '@/utils/appointmentFormUtils';

export const createAppointmentFromData = (
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

interface MultipleEvent {
  id: string;
  employeeId: string;
  time: string;
  serviceType: string;
  title: string;
  duration: string;
  notes: string;
}

export const createAdditionalAppointments = (
  formData: any,
  clientId: string,
  dateStr: string,
  multipleEvents: MultipleEvent[]
): Appointment[] => {
  return multipleEvents.map(event => 
    createAppointmentFromData(
      { 
        ...formData, 
        employeeId: event.employeeId, 
        time: event.time, 
        duration: event.duration, 
        serviceType: event.serviceType, 
        title: event.title, 
        notes: event.notes 
      },
      clientId,
      dateStr
    )
  );
};

export const createRecurringAppointments = (
  formData: any,
  clientId: string,
  selectedDates: Date[],
  multipleEvents: MultipleEvent[]
): Appointment[] => {
  const recurringAppointments: Appointment[] = [];
  
  console.log('DEBUG - Inizio processamento date ricorrenti, totale date:', selectedDates.length);
  
  for (let i = 0; i < selectedDates.length; i++) {
    const selectedDate = selectedDates[i];
    const dateStr = selectedDate.toISOString().split('T')[0];
    console.log(`DEBUG - Processando data ricorrente ${i + 1}/${selectedDates.length}:`, dateStr);
    
    // Main appointment for this recurring date
    const recurringMainAppointment = createAppointmentFromData(
      formData,
      clientId,
      dateStr
    );
    recurringAppointments.push(recurringMainAppointment);
    console.log('DEBUG - Appuntamento ricorrente principale aggiunto per:', dateStr);

    // Additional events for this recurring date
    for (let j = 0; j < multipleEvents.length; j++) {
      const event = multipleEvents[j];
      const recurringAdditionalAppointment = createAppointmentFromData(
        { 
          ...formData, 
          employeeId: event.employeeId, 
          time: event.time, 
          duration: event.duration, 
          serviceType: event.serviceType, 
          title: event.title, 
          notes: event.notes 
        },
        clientId,
        dateStr
      );
      recurringAppointments.push(recurringAdditionalAppointment);
      console.log(`DEBUG - Appuntamento ricorrente aggiuntivo ${j + 1} aggiunto per:`, dateStr);
    }
  }

  console.log('DEBUG - Totale appuntamenti ricorrenti da salvare:', recurringAppointments.length);
  return recurringAppointments;
};
