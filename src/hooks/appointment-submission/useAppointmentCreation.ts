
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
    console.log('🔧 AppointmentCreation - INIZIO CREAZIONE APPUNTAMENTI:', {
      mainDate: format(date, 'yyyy-MM-dd'),
      selectedDatesInput: selectedDates?.map(d => format(d, 'yyyy-MM-dd')) || [],
      selectedDatesCount: selectedDates?.length || 0,
      multipleEventsCount: multipleEvents.length,
      formDataValid: !!formData.client,
      clientId: finalClientId
    });

    // Create main appointment
    const mainAppointment = createAppointmentFromData(
      formData,
      finalClientId,
      format(date, 'yyyy-MM-dd'),
      appointmentToEdit?.id
    );

    console.log('✅ Appuntamento principale creato:', {
      date: mainAppointment.date,
      client: mainAppointment.client,
      time: mainAppointment.time
    });

    // Create additional appointments for multiple events on the same day
    const additionalAppointments = createAdditionalAppointments(
      formData,
      finalClientId,
      format(date, 'yyyy-MM-dd'),
      multipleEvents
    );

    console.log('✅ Appuntamenti aggiuntivi preparati:', {
      count: additionalAppointments.length,
      dates: additionalAppointments.map(a => ({ date: a.date, time: a.time }))
    });

    // PARTE CRITICA: Create recurring appointments
    console.log('📅 CREAZIONE RICORRENTI - INPUT DETTAGLIATO:', {
      selectedDates: selectedDates?.map(d => ({
        original: d,
        formatted: format(d, 'yyyy-MM-dd'),
        isMainDate: format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      })) || [],
      mainDateToExclude: format(date, 'yyyy-MM-dd'),
      willCreateRecurring: selectedDates && selectedDates.length > 0
    });
    
    const recurringAppointments = createRecurringAppointments(
      formData,
      finalClientId,
      selectedDates || [], // Assicuriamoci che non sia undefined
      multipleEvents,
      date
    );

    console.log('🎯 APPUNTAMENTI RICORRENTI CREATI - RISULTATO FINALE:', {
      totalCreated: recurringAppointments.length,
      expectedCount: selectedDates ? (selectedDates.length - 1) * (multipleEvents.length + 1) : 0, // -1 per escludere main date
      selectedDatesWereValid: !!selectedDates && selectedDates.length > 0,
      dateDetails: recurringAppointments.map(app => ({ 
        date: app.date, 
        time: app.time, 
        client: app.client,
        service: app.serviceType
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
