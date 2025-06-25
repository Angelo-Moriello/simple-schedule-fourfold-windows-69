
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Appointment } from '@/types/appointment';

export const useAppointmentSchedulerState = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [isClientManagerOpen, setIsClientManagerOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleOpenAppointmentForm = (employeeId: number, time: string) => {
    setSelectedEmployeeId(employeeId);
    setSelectedTime(time);
    setAppointmentToEdit(null);
    setIsAppointmentFormOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    setSelectedEmployeeId(appointment.employeeId);
    setSelectedTime(appointment.time);
    setIsAppointmentFormOpen(true);
  };

  const handleCloseAppointmentForm = () => {
    setIsAppointmentFormOpen(false);
    setSelectedEmployeeId(null);
    setSelectedTime(null);
    setAppointmentToEdit(null);
  };

  const handleOpenEmployeeForm = () => {
    setIsEmployeeFormOpen(true);
  };

  const handleCloseEmployeeForm = () => {
    setIsEmployeeFormOpen(false);
  };

  const handleOpenClientManager = () => {
    setIsClientManagerOpen(true);
  };

  const handleCloseClientManager = () => {
    setIsClientManagerOpen(false);
  };

  const handleNavigateToHistory = () => {
    navigate('/history');
  };

  const handleNavigateToStatistics = () => {
    navigate('/statistics');
  };

  return {
    selectedDate,
    isAppointmentFormOpen,
    isEmployeeFormOpen,
    isClientManagerOpen,
    selectedEmployeeId,
    selectedTime,
    appointmentToEdit,
    showFullCalendar,
    setShowFullCalendar,
    handleDateSelect,
    handleOpenAppointmentForm,
    handleEditAppointment,
    handleCloseAppointmentForm,
    handleOpenEmployeeForm,
    handleCloseEmployeeForm,
    handleOpenClientManager,
    handleCloseClientManager,
    handleNavigateToHistory,
    handleNavigateToStatistics
  };
};
