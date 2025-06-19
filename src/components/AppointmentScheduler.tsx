import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Appointment, Employee } from '@/types/appointment';
import { 
  loadEmployeesFromSupabase, 
  loadAppointmentsFromSupabase,
  addEmployeeToSupabase,
  updateEmployeeInSupabase,
  deleteEmployeeFromSupabase,
  addAppointmentToSupabase,
  updateAppointmentInSupabase,
  deleteAppointmentFromSupabase,
  migrateLocalStorageToSupabase
} from '@/utils/supabaseStorage';
import AppointmentSchedulerHeader from './AppointmentSchedulerHeader';
import AppointmentSchedulerControls from './AppointmentSchedulerControls';
import EmployeeTimeSlotGrid from './EmployeeTimeSlotGrid';
import AppointmentForm from './AppointmentForm';
import EmployeeForm from './EmployeeForm';
import { format } from 'date-fns';

const AppointmentScheduler = () => {
  const navigate = useNavigate();
  
  // Initialize states properly
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Inizio caricamento dati da Supabase...');
        
        // Check if we need to migrate from localStorage
        const hasLocalData = localStorage.getItem('employees') || localStorage.getItem('appointments');
        if (hasLocalData) {
          console.log('Dati localStorage trovati, avvio migrazione...');
          toast.info('Migrazione dati in corso...');
          const migrationSuccess = await migrateLocalStorageToSupabase();
          if (migrationSuccess) {
            // Clear localStorage after successful migration
            localStorage.removeItem('employees');
            localStorage.removeItem('appointments');
            localStorage.removeItem('employeesTimestamp');
            localStorage.removeItem('appointmentsTimestamp');
            console.log('Migrazione completata, localStorage pulito');
            toast.success('Dati migrati con successo su Supabase!');
          } else {
            console.error('Migrazione fallita');
            toast.error('Errore durante la migrazione dei dati');
          }
        }
        
        // Load current data from Supabase
        console.log('Caricamento dipendenti e appuntamenti da Supabase...');
        const [loadedEmployees, loadedAppointments] = await Promise.all([
          loadEmployeesFromSupabase(),
          loadAppointmentsFromSupabase()
        ]);
        
        console.log('Dipendenti caricati:', loadedEmployees);
        console.log('Appuntamenti caricati:', loadedAppointments);
        
        setEmployees(loadedEmployees);
        setAppointments(loadedAppointments);
        
        toast.success(`Caricati ${loadedEmployees.length} dipendenti e ${loadedAppointments.length} appuntamenti`);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        toast.error('Errore nel caricamento dei dati da Supabase');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Ricarica i dati quando cambia la data selezionata
  useEffect(() => {
    const reloadDataForDate = async () => {
      try {
        console.log('Ricaricamento dati per la data:', format(selectedDate, 'yyyy-MM-dd'));
        const [loadedEmployees, loadedAppointments] = await Promise.all([
          loadEmployeesFromSupabase(),
          loadAppointmentsFromSupabase()
        ]);
        
        setEmployees(loadedEmployees);
        setAppointments(loadedAppointments);
        console.log('Dati ricaricati per la nuova data');
      } catch (error) {
        console.error('Errore nel ricaricamento dei dati:', error);
      }
    };

    reloadDataForDate();
  }, [selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowFullCalendar(false);
  };

  const addAppointment = async (newAppointment: Appointment) => {
    try {
      console.log('Aggiunta nuovo appuntamento:', newAppointment);
      await addAppointmentToSupabase(newAppointment);
      setAppointments(prev => [...prev, newAppointment]);
      setIsAppointmentFormOpen(false);
      toast.success('Appuntamento aggiunto con successo!');
    } catch (error) {
      console.error('Errore nell\'aggiungere l\'appuntamento:', error);
      toast.error('Errore nell\'aggiungere l\'appuntamento');
    }
  };

  const updateAppointment = async (updatedAppointment: Appointment) => {
    try {
      console.log('Aggiornamento appuntamento:', updatedAppointment);
      await updateAppointmentInSupabase(updatedAppointment);
      setAppointments(prev => prev.map(appointment =>
        appointment.id === updatedAppointment.id ? updatedAppointment : appointment
      ));
      setAppointmentToEdit(null);
      setIsAppointmentFormOpen(false);
      toast.success('Appuntamento modificato con successo!');
    } catch (error) {
      console.error('Errore nella modifica dell\'appuntamento:', error);
      toast.error('Errore nella modifica dell\'appuntamento');
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    try {
      console.log('Eliminazione appuntamento:', appointmentId);
      await deleteAppointmentFromSupabase(appointmentId);
      setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
      toast.success('Appuntamento eliminato con successo!');
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'appuntamento:', error);
      toast.error('Errore nell\'eliminazione dell\'appuntamento');
    }
  };

  const addEmployee = async (newEmployee: Employee) => {
    try {
      console.log('Aggiunta nuovo dipendente:', newEmployee);
      await addEmployeeToSupabase(newEmployee);
      setEmployees(prev => [...prev, newEmployee]);
      setIsEmployeeFormOpen(false);
      toast.success('Dipendente aggiunto con successo!');
    } catch (error) {
      console.error('Errore nell\'aggiungere il dipendente:', error);
      toast.error('Errore nell\'aggiungere il dipendente');
    }
  };

  const updateEmployee = async (updatedEmployee: Employee) => {
    try {
      console.log('Aggiornamento dipendente:', updatedEmployee);
      await updateEmployeeInSupabase(updatedEmployee);
      setEmployees(prev => prev.map(employee =>
        employee.id === updatedEmployee.id ? updatedEmployee : employee
      ));
      setIsEmployeeFormOpen(false);
      toast.success('Dipendente modificato con successo!');
    } catch (error) {
      console.error('Errore nella modifica del dipendente:', error);
      toast.error('Errore nella modifica del dipendente');
    }
  };

  const deleteEmployee = async (employeeId: number) => {
    try {
      console.log('Eliminazione dipendente:', employeeId);
      // Remove employee's appointments first
      const employeeAppointments = appointments.filter(appointment => appointment.employeeId === employeeId);
      for (const appointment of employeeAppointments) {
        await deleteAppointmentFromSupabase(appointment.id);
      }
      
      // Then remove the employee
      await deleteEmployeeFromSupabase(employeeId);
      
      setAppointments(prev => prev.filter(appointment => appointment.employeeId !== employeeId));
      setEmployees(prev => prev.filter(employee => employee.id !== employeeId));
      toast.success('Dipendente eliminato con successo!');
    } catch (error) {
      console.error('Errore nell\'eliminazione del dipendente:', error);
      toast.error('Errore nell\'eliminazione del dipendente');
    }
  };

  const handleOpenAppointmentForm = (employeeId: number, time: string) => {
    setSelectedEmployeeId(employeeId);
    setSelectedTime(time);
    setIsAppointmentFormOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
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

  const updateEmployeeName = async (employeeId: number, newName: string) => {
    try {
      console.log('Aggiornamento nome dipendente:', employeeId, newName);
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        const updatedEmployee = { ...employee, name: newName };
        await updateEmployeeInSupabase(updatedEmployee);
        setEmployees(prev => prev.map(emp =>
          emp.id === employeeId ? updatedEmployee : emp
        ));
        toast.success('Nome dipendente aggiornato con successo!');
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento del nome:', error);
      toast.error('Errore nell\'aggiornamento del nome');
    }
  };

  const handleUpdateEmployeeVacations = async (employeeId: number, vacations: string[]) => {
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        const updatedEmployee = { ...employee, vacations };
        await updateEmployeeInSupabase(updatedEmployee);
        setEmployees(prev => prev.map(emp =>
          emp.id === employeeId ? updatedEmployee : emp
        ));
        toast.success('Ferie aggiornate con successo!');
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle ferie:', error);
      toast.error('Errore nell\'aggiornamento delle ferie');
    }
  };

  // Navigation handlers
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

  // Filtra gli appuntamenti per la data corrente per l'header
  const todaysAppointments = appointments.filter(appointment => 
    appointment.date === format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        
        <AppointmentSchedulerHeader
          selectedDate={selectedDate}
          employees={employees}
          appointments={todaysAppointments}
        />

        <AppointmentSchedulerControls
          selectedDate={selectedDate}
          employees={employees}
          showFullCalendar={showFullCalendar}
          onDateSelect={handleDateSelect}
          onShowFullCalendar={setShowFullCalendar}
          onOpenEmployeeForm={handleOpenEmployeeForm}
          onUpdateEmployeeVacations={handleUpdateEmployeeVacations}
          onNavigateToHistory={handleNavigateToHistory}
          onNavigateToStatistics={handleNavigateToStatistics}
        />

        <EmployeeTimeSlotGrid
          employees={employees}
          appointments={appointments}
          selectedDate={selectedDate}
          onAddAppointment={handleOpenAppointmentForm}
          onEditAppointment={handleEditAppointment}
          onDeleteAppointment={deleteAppointment}
          onUpdateEmployeeName={updateEmployeeName}
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
      </div>
    </div>
  );
};

export default AppointmentScheduler;
