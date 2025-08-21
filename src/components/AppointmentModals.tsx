
import React from 'react';
import { Appointment, Employee } from '@/types/appointment';
import AppointmentForm from './AppointmentForm';
import EmployeeForm from './EmployeeForm';
import ClientManager from './ClientManager';

interface AppointmentModalsProps {
  isAppointmentFormOpen: boolean;
  isEmployeeFormOpen: boolean;
  isClientManagerOpen: boolean;
  selectedEmployeeId: number | null;
  selectedTime: string | null;
  selectedDate: Date;
  appointmentToEdit: Appointment | null;
  employees: Employee[];
  appointments?: Appointment[]; // Add this prop
  onCloseAppointmentForm: () => void;
  onCloseEmployeeForm: () => void;
  onCloseClientManager: () => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointment: Appointment) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  forcePageRefresh?: () => void;
}

const AppointmentModals: React.FC<AppointmentModalsProps> = ({
  isAppointmentFormOpen,
  isEmployeeFormOpen,
  isClientManagerOpen,
  selectedEmployeeId,
  selectedTime,
  selectedDate,
  appointmentToEdit,
  employees,
  appointments = [], // Default to empty array
  onCloseAppointmentForm,
  onCloseEmployeeForm,
  onCloseClientManager,
  addAppointment,
  updateAppointment,
  addEmployee,
  updateEmployee,
  forcePageRefresh
}) => {
  return (
    <>
      <AppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={onCloseAppointmentForm}
        addAppointment={addAppointment}
        updateAppointment={updateAppointment}
        employeeId={selectedEmployeeId}
        time={selectedTime}
        date={selectedDate}
        appointmentToEdit={appointmentToEdit}
        employees={employees}
        existingAppointments={appointments} // Pass existing appointments
        forcePageRefresh={forcePageRefresh}
      />

      <EmployeeForm
        isOpen={isEmployeeFormOpen}
        onClose={onCloseEmployeeForm}
        addEmployee={addEmployee}
        updateEmployee={updateEmployee}
        employees={employees}
      />

      <ClientManager
        isOpen={isClientManagerOpen}
        onClose={onCloseClientManager}
      />
    </>
  );
};

export default AppointmentModals;
