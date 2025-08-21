
import React from 'react';
import { Appointment, Employee } from '@/types/appointment';
import AppointmentFormContainer from './appointment-form/AppointmentFormContainer';
import AppointmentFormFields from './appointment-form/AppointmentFormFields';
import AppointmentFormActions from './appointment-form/AppointmentFormActions';
import { useAppointmentForm, appointmentColors, generateTimeSlots } from './appointment-form/AppointmentFormLogic';
import { format } from 'date-fns';

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
  existingAppointments?: Appointment[];
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
  employees,
  existingAppointments = []
}) => {
  const {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit,
    handleGoogleCalendarSync,
    serviceCategories,
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
    onClose,
    existingAppointments
  });


  const timeSlots = generateTimeSlots();

  const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employeeId?.toString() || '0'));
  const availableServices = selectedEmployee && serviceCategories[selectedEmployee.specialization] 
    ? serviceCategories[selectedEmployee.specialization].services
    : [];

  // Create a full Appointment object for the form fields
  const fullAppointmentData: Appointment = {
    id: appointmentToEdit?.id || '',
    employeeId: parseInt(formData.employeeId?.toString() || '0'),
    date: format(date, 'yyyy-MM-dd'),
    time: formData.time || '',
    title: formData.title || '',
    client: formData.client || '',
    duration: parseInt(formData.duration?.toString() || '30'),
    notes: formData.notes || '',
    email: formData.email || '',
    phone: formData.phone || '',
    color: formData.color || appointmentColors[0].value,
    serviceType: formData.serviceType || '',
    clientId: formData.clientId || ''
  };

  // Handler to update form data from full appointment object
  const handleFormDataChange = (appointmentData: Appointment) => {
    setFormData({
      employeeId: appointmentData.employeeId?.toString() || '',
      time: appointmentData.time || '',
      title: appointmentData.title || '',
      client: appointmentData.client || '',
      duration: appointmentData.duration?.toString() || '30',
      notes: appointmentData.notes || '',
      email: appointmentData.email || '',
      phone: appointmentData.phone || '',
      color: appointmentData.color || appointmentColors[0].value,
      serviceType: appointmentData.serviceType || '',
      clientId: appointmentData.clientId || ''
    });
  };

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
    selectedDates: selectedDates.length,
    existingAppointments: existingAppointments.length
  });

  return (
    <AppointmentFormContainer
      isOpen={isOpen}
      onClose={onClose}
      appointmentToEdit={appointmentToEdit}
    >
      <AppointmentFormFields
        formData={fullAppointmentData}
        setFormData={handleFormDataChange}
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
        serviceCategories={serviceCategories}
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
