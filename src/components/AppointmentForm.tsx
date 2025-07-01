
import React, { useEffect, useState } from 'react';
import { Appointment, Employee } from '@/types/appointment';
import AppointmentFormContainer from './appointment-form/AppointmentFormContainer';
import AppointmentFormFields from './appointment-form/AppointmentFormFields';
import AppointmentFormActions from './appointment-form/AppointmentFormActions';
import { useAppointmentForm, appointmentColors, generateTimeSlots } from './appointment-form/AppointmentFormLogic';
import { getStoredServices } from '@/utils/serviceStorage';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  addAppointment?: (appointment: Appointment) => void;
  updateAppointment?: (appointment: Appointment) => void;
  employeeId: number | null;
  time: string | null;
  date: Date;
  appointmentToEdit: Appointment | null;
  employees: Employee[];
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  addAppointment,
  updateAppointment,
  employeeId,
  time,
  date,
  appointmentToEdit,
  employees
}) => {
  const [serviceCategories, setServiceCategories] = useState(getStoredServices());

  const {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit,
    handleGoogleCalendarSync,
    multipleEvents,
    setMultipleEvents,
    selectedDates,
    setSelectedDates
  } = useAppointmentForm({
    isOpen,
    appointmentToEdit,
    employeeId,
    time,
    date,
    addAppointment,
    updateAppointment,
    onClose
  });

  // Ricarica i servizi quando il form si apre o quando cambiano
  useEffect(() => {
    if (isOpen) {
      console.log('AppointmentForm - Ricaricando servizi per form aperto');
      const refreshedServices = getStoredServices();
      setServiceCategories(refreshedServices);
    }
  }, [isOpen]);

  // Listener per aggiornamenti ai servizi
  useEffect(() => {
    const handleServicesUpdated = (event: CustomEvent) => {
      console.log('AppointmentForm - Ricevuto aggiornamento servizi:', event.detail);
      setServiceCategories(event.detail);
    };

    const handleStorageChange = () => {
      console.log('AppointmentForm - Storage change rilevato, ricaricando servizi');
      const refreshedServices = getStoredServices();
      setServiceCategories(refreshedServices);
    };

    window.addEventListener('servicesUpdated', handleServicesUpdated as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('servicesUpdated', handleServicesUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const timeSlots = generateTimeSlots();

  const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employeeId));
  const availableServices = selectedEmployee && serviceCategories[selectedEmployee.specialization] 
    ? serviceCategories[selectedEmployee.specialization].services
    : [];

  console.log('DEBUG - AppointmentForm rendering with:', {
    selectedEmployee: selectedEmployee ? {
      id: selectedEmployee.id,
      name: selectedEmployee.name,
      specialization: selectedEmployee.specialization
    } : 'none',
    availableServices: availableServices.length,
    serviceCategories: Object.keys(serviceCategories),
    servicesDetail: serviceCategories,
    formDataEmployeeId: formData.employeeId,
    multipleEvents: multipleEvents.length,
    selectedDates: selectedDates.length
  });

  return (
    <AppointmentFormContainer
      isOpen={isOpen}
      onClose={onClose}
      appointmentToEdit={appointmentToEdit}
    >
      <AppointmentFormFields
        formData={formData}
        setFormData={setFormData}
        employees={employees}
        timeSlots={timeSlots}
        appointmentColors={appointmentColors}
        availableServices={availableServices}
        selectedEmployee={selectedEmployee}
        appointmentToEdit={appointmentToEdit}
        multipleEvents={multipleEvents}
        onMultipleEventsChange={setMultipleEvents}
        selectedDates={selectedDates}
        onSelectedDatesChange={setSelectedDates}
        mainDate={date}
      />

      <AppointmentFormActions
        isSubmitting={isSubmitting}
        appointmentToEdit={appointmentToEdit}
        onClose={onClose}
        onSubmit={handleSubmit}
      />
    </AppointmentFormContainer>
  );
};

export default AppointmentForm;
