
import React, { useEffect } from 'react';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions';
import { useAppointmentActions } from '@/hooks/useAppointmentActions';
import { useAppointmentSchedulerState } from '@/hooks/useAppointmentSchedulerState';
import AppointmentSchedulerLayout from './AppointmentSchedulerLayout';
import AppointmentModals from './AppointmentModals';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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

  // Enhanced page refresh function for mobile
  const forcePageRefresh = () => {
    console.log('DEBUG - Forzando aggiornamento pagina...');
    
    // Show loading state briefly
    toast.info('Sincronizzazione in corso...', { duration: 1000 });
    
    // Force reload with a slight delay to allow UI feedback
    setTimeout(() => {
      // Try location.reload first, fallback to window.location.href
      try {
        window.location.reload();
      } catch (error) {
        console.error('Errore nel reload, usando fallback:', error);
        window.location.href = window.location.href;
      }
    }, 1000);
  };

  // Manual sync function for mobile users
  const handleManualSync = async () => {
    try {
      toast.info('Sincronizzazione manuale in corso...');
      
      // Force reload data
      window.location.reload();
    } catch (error) {
      console.error('Errore nella sincronizzazione manuale:', error);
      toast.error('Errore nella sincronizzazione');
    }
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

  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-xl border border-white/50 max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4 sm:mb-6"></div>
          <p className="text-gray-700 text-base sm:text-lg font-medium">Caricamento dati da Supabase...</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">Sincronizzazione in corso...</p>
          {isMobile && (
            <p className="text-blue-600 text-xs mt-2">Modalità mobile rilevata</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Manual sync button for mobile users */}
        {isMobile && (
          <div className="fixed top-4 right-4 z-50">
            <Button
              onClick={handleManualSync}
              size="sm"
              variant="outline"
              className="bg-white/90 backdrop-blur-sm shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync
            </Button>
          </div>
        )}

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
        onCloseAppointmentForm={handleCloseAppointmentForm}
        onCloseEmployeeForm={handleCloseEmployeeForm}
        onCloseClientManager={handleCloseClientManager}
        addAppointment={addAppointment}
        updateAppointment={updateAppointment}
        addEmployee={addEmployee}
        updateEmployee={updateEmployee}
      />
    </>
  );
};

export default AppointmentScheduler;
