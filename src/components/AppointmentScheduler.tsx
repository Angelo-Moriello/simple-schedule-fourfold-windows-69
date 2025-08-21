
import React, { useEffect } from 'react';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions';
import { useAppointmentActions } from '@/hooks/useAppointmentActions';
import { useAppointmentSchedulerState } from '@/hooks/useAppointmentSchedulerState';
import AppointmentSchedulerLayout from './AppointmentSchedulerLayout';
import AppointmentModals from './AppointmentModals';

const AppointmentScheduler = () => {
  const {
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
  } = useAppointmentSchedulerState();

  const { appointments, employees, isLoading, setAppointments, setEmployees } = useAppointmentData(selectedDate);

  // Funzione di refresh che ricarica i dati
  const forcePageRefresh = () => {
    console.log('🔄 Refresh richiesto, ricaricando i dati...');
    window.location.reload();
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
  } = useAppointmentActions({ appointments, setAppointments, forcePageRefresh });

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
    <>
      <div className="relative">
        <AppointmentSchedulerLayout
          selectedDate={selectedDate}
          employees={employees}
          appointments={appointments}
          showFullCalendar={showFullCalendar}
          onDateSelect={handleDateSelect}
          onShowFullCalendar={setShowFullCalendar}
          onOpenEmployeeForm={handleOpenEmployeeForm}
          onUpdateEmployeeVacations={(employeeId, vacations) => handleUpdateEmployeeVacations(employeeId, vacations, employees)}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToStatistics={handleNavigateToStatistics}
          onOpenClientManager={handleOpenClientManager}
          onAddAppointment={handleOpenAppointmentForm}
          onEditAppointment={handleEditAppointment}
          onDeleteAppointment={deleteAppointment}
          onUpdateEmployeeName={(employeeId, newName) => updateEmployeeName(employeeId, newName, employees)}
        />
      </div>

      <AppointmentModals
        isAppointmentFormOpen={isAppointmentFormOpen}
        isEmployeeFormOpen={isEmployeeFormOpen}
        isClientManagerOpen={isClientManagerOpen}
        selectedEmployeeId={selectedEmployeeId}
        selectedTime={selectedTime}
        selectedDate={selectedDate}
        appointmentToEdit={appointmentToEdit}
        employees={employees}
        appointments={appointments}
        onCloseAppointmentForm={handleCloseAppointmentForm}
        onCloseEmployeeForm={handleCloseEmployeeForm}
        onCloseClientManager={handleCloseClientManager}
        addAppointment={addAppointment}
        updateAppointment={updateAppointment}
        addEmployee={addEmployee}
        updateEmployee={updateEmployee}
        forcePageRefresh={forcePageRefresh}
      />
    </>
  );
};

export default AppointmentScheduler;
