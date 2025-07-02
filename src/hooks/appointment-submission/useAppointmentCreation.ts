
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';

// Genera un UUID v4 standard
const generateStandardUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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
      selectedDatesInput: selectedDates,
      selectedDatesCount: selectedDates.length,
      multipleEventsCount: multipleEvents.length,
      formDataValid: !!formData.client && !!formData.serviceType,
      clientId: finalClientId
    });

    // 1. Crea appuntamento principale con ID UUID standard
    const mainAppointmentId = appointmentToEdit?.id || generateStandardUUID();
    const mainAppointment: Appointment = {
      id: mainAppointmentId,
      employeeId: parseInt(formData.employeeId),
      date: format(date, 'yyyy-MM-dd'),
      time: formData.time,
      title: formData.title || '',
      client: formData.client,
      duration: parseInt(formData.duration),
      notes: formData.notes || '',
      email: formData.email || '',
      phone: formData.phone || '',
      color: formData.color,
      serviceType: formData.serviceType,
      clientId: finalClientId
    };

    console.log('✅ Appuntamento principale creato:', {
      date: mainAppointment.date,
      client: mainAppointment.client,
      time: mainAppointment.time,
      id: mainAppointment.id
    });

    // 2. Crea appuntamenti aggiuntivi con ID UUID standard
    const additionalAppointments: Appointment[] = multipleEvents.map((event, index) => {
      const additionalId = generateStandardUUID();
      return {
        id: additionalId,
        employeeId: parseInt(event.employeeId),
        date: format(date, 'yyyy-MM-dd'),
        time: event.time,
        title: event.title || '',
        client: formData.client,
        duration: parseInt(event.duration),
        notes: event.notes || '',
        email: formData.email || '',
        phone: formData.phone || '',
        color: formData.color,
        serviceType: event.serviceType,
        clientId: finalClientId
      };
    });

    console.log('✅ Appuntamenti aggiuntivi preparati:', {
      count: additionalAppointments.length,
      dates: additionalAppointments.map(a => ({ date: a.date, time: a.time, id: a.id }))
    });

    // 3. Crea appuntamenti ricorrenti con ID UUID standard
    console.log('📅 CREAZIONE RICORRENTI - INPUT DETTAGLIATO:', {
      selectedDates,
      mainDateToExclude: format(date, 'yyyy-MM-dd'),
      willCreateRecurring: selectedDates && selectedDates.length > 0
    });

    const recurringAppointments: Appointment[] = [];

    if (selectedDates && Array.isArray(selectedDates) && selectedDates.length > 0) {
      console.log('DEBUG - Inizio processamento date ricorrenti:', {
        totalDates: selectedDates.length,
        mainDate: format(date, 'yyyy-MM-dd'),
        selectedDates: selectedDates.map(d => format(d, 'yyyy-MM-dd'))
      });

      const mainDateString = format(date, 'yyyy-MM-dd');
      const filteredDates = selectedDates.filter(selectedDate => {
        const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
        return selectedDateString !== mainDateString;
      });

      console.log('DEBUG - Date filtrate (senza data principale):', {
        original: selectedDates.length,
        filtered: filteredDates.length,
        excluded: mainDateString,
        remaining: filteredDates.map(d => format(d, 'yyyy-MM-dd'))
      });

      filteredDates.forEach((selectedDate, index) => {
        const recurringId = generateStandardUUID();
        const recurringAppointment: Appointment = {
          id: recurringId,
          employeeId: parseInt(formData.employeeId),
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: formData.time,
          title: formData.title || '',
          client: formData.client,
          duration: parseInt(formData.duration),
          notes: formData.notes || '',
          email: formData.email || '',
          phone: formData.phone || '',
          color: formData.color,
          serviceType: formData.serviceType,
          clientId: finalClientId
        };
        
        recurringAppointments.push(recurringAppointment);
        
        console.log(`DEBUG - Creato ricorrente ${index + 1}:`, {
          date: recurringAppointment.date,
          client: recurringAppointment.client,
          time: recurringAppointment.time,
          id: recurringAppointment.id
        });
      });
    }

    console.log('🎯 APPUNTAMENTI RICORRENTI CREATI - RISULTATO FINALE:', {
      totalCreated: recurringAppointments.length,
      expectedCount: selectedDates ? selectedDates.length - 1 : -2,
      selectedDatesWereValid: selectedDates && Array.isArray(selectedDates),
      dateDetails: recurringAppointments.map(a => ({ date: a.date, time: a.time, id: a.id }))
    });

    return {
      mainAppointment,
      additionalAppointments,
      recurringAppointments
    };
  };

  return { createAppointments };
};
