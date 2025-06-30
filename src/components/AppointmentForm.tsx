
import React from 'react';
import { Appointment, Employee } from '@/types/appointment';
import AppointmentFormContainer from './appointment-form/AppointmentFormContainer';
import AppointmentFormFields from './appointment-form/AppointmentFormFields';
import AppointmentFormActions from './appointment-form/AppointmentFormActions';
import { useAppointmentForm, appointmentColors, generateTimeSlots, getStoredServices } from './appointment-form/AppointmentFormLogic';

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
  const {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit,
    handleGoogleCalendarSync
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

  const timeSlots = generateTimeSlots();
  const serviceCategories = getStoredServices();

  const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employeeId));
  const availableServices = selectedEmployee && serviceCategories[selectedEmployee.specialization] 
    ? serviceCategories[selectedEmployee.specialization].services
    : [];

  console.log('DEBUG - Servizi disponibili per dipendente:', {
    selectedEmployee,
    specialization: selectedEmployee?.specialization,
    availableServices,
    serviceCategories
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
