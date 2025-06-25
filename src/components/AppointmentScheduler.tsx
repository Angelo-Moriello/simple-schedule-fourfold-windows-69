
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-xl border border-white/50 max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4 sm:mb-6"></div>
          <p className="text-gray-700 text-base sm:text-lg font-medium">Caricamento dati da Supabase...</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">Sincronizzazione in corso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        
        <AppointmentSchedulerHeader
          selectedDate={selectedDate}
          employees={employees}
          appointments={appointments}
          onDateSelect={handleDateSelect}
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

        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-3 sm:p-4 lg:p-6">
          <EmployeeTimeSlotGrid
            employees={employees}
            appointments={appointments}
            selectedDate={selectedDate}
            onAddAppointment={handleOpenAppointmentForm}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={deleteAppointment}
            onUpdateEmployeeName={(employeeId, newName) => updateEmployeeName(employeeId, newName, employees)}
          />
        </div>

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
