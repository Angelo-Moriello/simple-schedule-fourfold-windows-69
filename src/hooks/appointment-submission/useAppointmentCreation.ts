
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';

// Non genera più ID qui - sarà fatto dal saver che controlla l'unicità
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

    // 1. Crea appuntamento principale - ID verrà generato dal saver
    const mainAppointment: Appointment = {
      id: appointmentToEdit?.id || 'temp-main-id', // ID temporaneo, sarà sostituito
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
      tempId: mainAppointment.id
    });

    // 2. Crea appuntamenti aggiuntivi - ID verranno generati dal saver
    const additionalAppointments: Appointment[] = multipleEvents.map((event, index) => {
      return {
        id: `temp-additional-${index}`, // ID temporaneo, sarà sostituito
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
      dates: additionalAppointments.map(a => ({ date: a.date, time: a.time, tempId: a.id }))
    });

    // 3. Crea appuntamenti ricorrenti - ID verranno generati dal saver
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
        const recurringAppointment: Appointment = {
          id: `temp-recurring-${index}`, // ID temporaneo, sarà sostituito
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
          tempId: recurringAppointment.id
        });
      });
    }

    console.log('🎯 APPUNTAMENTI RICORRENTI CREATI - RISULTATO FINALE:', {
      totalCreated: recurringAppointments.length,
      expectedCount: selectedDates ? selectedDates.length - 1 : -2,
      selectedDatesWereValid: selectedDates && Array.isArray(selectedDates),
      dateDetails: recurringAppointments.map(a => ({ date: a.date, time: a.time, tempId: a.id }))
    });

    return {
      mainAppointment,
      additionalAppointments,
      recurringAppointments
    };
  };

  return { createAppointments };
};
