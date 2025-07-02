
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { 
  createAppointmentFromData, 
  createAdditionalAppointments, 
  createRecurringAppointments 
} from '@/utils/appointment/appointmentCreation';

interface MultipleEvent {
  id: string;
  employeeId: string;
  time: string;
  serviceType: string;
  title: string;
  duration: string;
  notes: string;
}

export const useAppointmentCreation = () => {
  const createAppointments = (
    formData: any,
    finalClientId: string,
    date: Date,
    multipleEvents: MultipleEvent[],
    selectedDates: Date[],
    appointmentToEdit: Appointment | null
  ) => {
    // Create main appointment
    const mainAppointment = createAppointmentFromData(
      formData,
      finalClientId,
      format(date, 'yyyy-MM-dd'),
      appointmentToEdit?.id
    );

    console.log('✅ AppointmentCreation - Appuntamento principale creato per:', format(date, 'yyyy-MM-dd'));

    // Create additional appointments for multiple events on the same day
    const additionalAppointments = createAdditionalAppointments(
      formData,
      finalClientId,
      format(date, 'yyyy-MM-dd'),
      multipleEvents
    );

    console.log('✅ AppointmentCreation - Appuntamenti aggiuntivi preparati:', additionalAppointments.length);

    // Create recurring appointments for each selected date (ESCLUSA la data principale)
    console.log('📅 AppointmentCreation - PREPARAZIONE RICORRENTI con date:', {
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

    console.log('✅ AppointmentCreation - APPUNTAMENTI RICORRENTI PREPARATI:', {
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

    return {
      mainAppointment,
      additionalAppointments,
      recurringAppointments
    };
  };

  return { createAppointments };
};
