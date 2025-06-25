
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Appointment } from '@/types/appointment';

export const useAppointmentScheduler = () => {
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
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
    setShowFullCalendar(false);
  };

  const handleOpenAppointmentForm = (employeeId: number, time: string) => {
    console.log('DEBUG - Apertura form appuntamento:', { employeeId, time });
    setSelectedEmployeeId(employeeId);
    setSelectedTime(time);
    setIsAppointmentFormOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    console.log('DEBUG - Modifica appuntamento:', appointment);
    setAppointmentToEdit(appointment);
    setIsAppointmentFormOpen(true);
  };

  const handleCloseAppointmentForm = () => {
    setIsAppointmentFormOpen(false);
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
    setSelectedDate,
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
