
import React, { useEffect } from 'react';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions';
import { useAppointmentActions } from '@/hooks/useAppointmentActions';
import { useAppointmentSchedulerState } from '@/hooks/useAppointmentSchedulerState';
import AppointmentSchedulerLayout from './AppointmentSchedulerLayout';
import AppointmentModals from './AppointmentModals';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { clearAllData, syncData } from '@/utils/dataStorage';

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
    console.log('DEBUG - Forzando aggiornamento pagina...', 'Mobile:', isMobile());
    
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
      console.log('DEBUG - Sync manuale richiesto, mobile:', isMobile());
      
      // Clear potentially corrupted local data
      syncData();
      
      // Wait a bit then force reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Errore nella sincronizzazione manuale:', error);
      toast.error('Errore nella sincronizzazione');
    }
  };

  // Emergency data clear for mobile troubleshooting
  const handleEmergencyClear = () => {
    try {
      toast.info('Pulizia dati locale in corso...');
      console.log('DEBUG - Pulizia emergenza dati, mobile:', isMobile());
      
      clearAllData();
      
      // Force reload after clearing
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Errore nella pulizia emergenza:', error);
      toast.error('Errore nella pulizia dati');
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
      mobile: isMobile(),
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
    console.log('DEBUG - Stato dipendenti cambiato:', {
      count: employees.length,
      mobile: isMobile(),
      employees: employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        vacationsCount: emp.vacations?.length || 0
      }))
    });
  }, [employees]);

  // Mobile detection
  const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Network status
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-xl border border-white/50 max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4 sm:mb-6"></div>
          <p className="text-gray-700 text-base sm:text-lg font-medium">Caricamento dati da Supabase...</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">Sincronizzazione in corso...</p>
          {isMobile() && (
            <div className="mt-3 space-y-1">
              <p className="text-blue-600 text-xs">Modalità mobile rilevata</p>
              <div className="flex items-center justify-center gap-1 text-xs">
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">Offline</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Enhanced mobile controls */}
        {isMobile() && (
          <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            <Button
              onClick={handleManualSync}
              size="sm"
              variant="outline"
              className="bg-white/90 backdrop-blur-sm shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync
            </Button>
            
            {/* Network status indicator */}
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isOnline 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </div>
            
            {/* Emergency clear button for troubleshooting */}
            <Button
              onClick={handleEmergencyClear}
              size="sm"
              variant="destructive"
              className="bg-red-500/90 hover:bg-red-600/90 backdrop-blur-sm shadow-lg text-xs"
            >
              Reset Dati
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
