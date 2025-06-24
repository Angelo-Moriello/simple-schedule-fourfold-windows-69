
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Appointment } from '@/types/appointment';
import AppointmentSchedulerHeader from './AppointmentSchedulerHeader';
import AppointmentSchedulerControls from './AppointmentSchedulerControls';
import EmployeeTimeSlotGrid from './EmployeeTimeSlotGrid';
import AppointmentForm from './AppointmentForm';
import EmployeeForm from './EmployeeForm';
import ClientManager from './ClientManager';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions';
import { useAppointmentActions } from '@/hooks/useAppointmentActions';

const AppointmentScheduler = () => {
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [isClientManagerOpen, setIsClientManagerOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const { appointments, employees, isLoading, setAppointments, setEmployees } = useAppointmentData(selectedDate);

  // Force page refresh function
  const forcePageRefresh = () => {
    console.log('DEBUG - Forzando aggiornamento pagina...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  useRealtimeSubscriptions({ setAppointments, setEmployees, forcePageRefresh });

  const {
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateEmployeeName,
    handleUpdateEmployeeVacations
  } = useAppointmentActions({ appointments, forcePageRefresh });

  // Debug effects
  useEffect(() => {
    console.log('DEBUG - Stato appuntamenti cambiato:', {
      count: appointments.length,
      appointments: appointments.map(apt => ({
        id: apt.id,
        employeeId: apt.employeeId,
        date: apt.date,
        time: apt.time,
        client: apt.client
      }))
    });
  }, [appointments]);

  useEffect(() => {
    console.log('DEBUG - Stato dipendenti cambiato:', employees.length, employees);
  }, [employees]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dati da Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        
        <AppointmentSchedulerHeader
          selectedDate={selectedDate}
          employees={employees}
          appointments={appointments}
        />

        <AppointmentSchedulerControls
          selectedDate={selectedDate}
          employees={employees}
          showFullCalendar={showFullCalendar}
          onDateSelect={handleDateSelect}
          onShowFullCalendar={setShowFullCalendar}
          onOpenEmployeeForm={handleOpenEmployeeForm}
          onUpdateEmployeeVacations={(employeeId, vacations) => handleUpdateEmployeeVacations(employeeId, vacations, employees)}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToStatistics={handleNavigateToStatistics}
          onOpenClientManager={handleOpenClientManager}
          appointments={appointments}
        />

        <EmployeeTimeSlotGrid
          employees={employees}
          appointments={appointments}
          selectedDate={selectedDate}
          onAddAppointment={handleOpenAppointmentForm}
          onEditAppointment={handleEditAppointment}
          onDeleteAppointment={deleteAppointment}
          onUpdateEmployeeName={(employeeId, newName) => updateEmployeeName(employeeId, newName, employees)}
        />

        <AppointmentForm
          isOpen={isAppointmentFormOpen}
          onClose={handleCloseAppointmentForm}
          addAppointment={addAppointment}
          updateAppointment={updateAppointment}
          employeeId={selectedEmployeeId}
          time={selectedTime}
          date={selectedDate}
          appointmentToEdit={appointmentToEdit}
          employees={employees}
        />

        <EmployeeForm
          isOpen={isEmployeeFormOpen}
          onClose={handleCloseEmployeeForm}
          addEmployee={addEmployee}
          updateEmployee={updateEmployee}
          employees={employees}
        />

        <ClientManager
          isOpen={isClientManagerOpen}
          onClose={handleCloseClientManager}
        />
      </div>
    </div>
  );
};

export default AppointmentScheduler;
