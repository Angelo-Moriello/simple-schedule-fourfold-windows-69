
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
import { supabase } from '@/integrations/supabase/client';
import AppointmentSchedulerHeader from './AppointmentSchedulerHeader';
import AppointmentSchedulerControls from './AppointmentSchedulerControls';
import EmployeeTimeSlotGrid from './EmployeeTimeSlotGrid';
import AppointmentForm from './AppointmentForm';
import EmployeeForm from './EmployeeForm';

const AppointmentScheduler = () => {
  const navigate = useNavigate();
  
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
        
        // Check if we need to migrate from localStorage
        const hasLocalData = localStorage.getItem('employees') || localStorage.getItem('appointments');
        if (hasLocalData) {
          toast.info('Migrazione dati in corso...');
          const migrationSuccess = await migrateLocalStorageToSupabase();
          if (migrationSuccess) {
            localStorage.removeItem('employees');
            localStorage.removeItem('appointments');
            localStorage.removeItem('employeesTimestamp');
            localStorage.removeItem('appointmentsTimestamp');
            toast.success('Dati migrati con successo su Supabase!');
          } else {
            toast.error('Errore durante la migrazione dei dati');
          }
        }
        
        // Load current data from Supabase
        const [loadedEmployees, loadedAppointments] = await Promise.all([
          loadEmployeesFromSupabase(),
          loadAppointmentsFromSupabase()
        ]);
        
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

  // Setup realtime subscriptions
  useEffect(() => {
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Realtime appointment change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newAppointment: Appointment = {
              id: payload.new.id,
              employeeId: payload.new.employee_id,
              date: payload.new.date,
              time: payload.new.time,
              title: payload.new.title || '',
              client: payload.new.client,
              duration: payload.new.duration,
              notes: payload.new.notes || '',
              email: payload.new.email || '',
              phone: payload.new.phone || '',
              color: payload.new.color,
              serviceType: payload.new.service_type
            };
            
            setAppointments(prev => {
              const exists = prev.find(apt => apt.id === newAppointment.id);
              if (!exists) {
                return [...prev, newAppointment];
              }
              return prev;
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedAppointment: Appointment = {
              id: payload.new.id,
              employeeId: payload.new.employee_id,
              date: payload.new.date,
              time: payload.new.time,
              title: payload.new.title || '',
              client: payload.new.client,
              duration: payload.new.duration,
              notes: payload.new.notes || '',
              email: payload.new.email || '',
              phone: payload.new.phone || '',
              color: payload.new.color,
              serviceType: payload.new.service_type
            };
            
            setAppointments(prev => prev.map(apt =>
              apt.id === updatedAppointment.id ? updatedAppointment : apt
            ));
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const employeesChannel = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        (payload) => {
          console.log('Realtime employee change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newEmployee: Employee = {
              id: payload.new.id,
              name: payload.new.name,
              color: payload.new.color,
              specialization: payload.new.specialization as 'Parrucchiere' | 'Estetista',
              vacations: payload.new.vacations || []
            };
            
            setEmployees(prev => {
              const exists = prev.find(emp => emp.id === newEmployee.id);
              if (!exists) {
                return [...prev, newEmployee];
              }
              return prev;
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedEmployee: Employee = {
              id: payload.new.id,
              name: payload.new.name,
              color: payload.new.color,
              specialization: payload.new.specialization as 'Parrucchiere' | 'Estetista',
              vacations: payload.new.vacations || []
            };
            
            setEmployees(prev => prev.map(emp =>
              emp.id === updatedEmployee.id ? updatedEmployee : emp
            ));
          } else if (payload.eventType === 'DELETE') {
            setEmployees(prev => prev.filter(emp => emp.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(employeesChannel);
    };
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowFullCalendar(false);
  };

  const addAppointment = async (newAppointment: Appointment) => {
    try {
      await addAppointmentToSupabase(newAppointment);
      // Non aggiornare lo stato qui - sarà aggiornato dal realtime
      setIsAppointmentFormOpen(false);
      toast.success('Appuntamento aggiunto con successo!');
    } catch (error) {
      console.error('Errore nell\'aggiungere l\'appuntamento:', error);
      toast.error('Errore nell\'aggiungere l\'appuntamento');
    }
  };

  const updateAppointment = async (updatedAppointment: Appointment) => {
    try {
      await updateAppointmentInSupabase(updatedAppointment);
      // Non aggiornare lo stato qui - sarà aggiornato dal realtime
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
      await deleteAppointmentFromSupabase(appointmentId);
      // Non aggiornare lo stato qui - sarà aggiornato dal realtime
      toast.success('Appuntamento eliminato con successo!');
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'appuntamento:', error);
      toast.error('Errore nell\'eliminazione dell\'appuntamento');
    }
  };

  const addEmployee = async (newEmployee: Employee) => {
    try {
      await addEmployeeToSupabase(newEmployee);
      // Non aggiornare lo stato qui - sarà aggiornato dal realtime
      setIsEmployeeFormOpen(false);
      toast.success('Dipendente aggiunto con successo!');
    } catch (error) {
      console.error('Errore nell\'aggiungere il dipendente:', error);
      toast.error('Errore nell\'aggiungere il dipendente');
    }
  };

  const updateEmployee = async (updatedEmployee: Employee) => {
    try {
      await updateEmployeeInSupabase(updatedEmployee);
      // Non aggiornare lo stato qui - sarà aggiornato dal realtime
      setIsEmployeeFormOpen(false);
      toast.success('Dipendente modificato con successo!');
    } catch (error) {
      console.error('Errore nella modifica del dipendente:', error);
      toast.error('Errore nella modifica del dipendente');
    }
  };

  const deleteEmployee = async (employeeId: number) => {
    try {
      // Remove employee's appointments first
      const employeeAppointments = appointments.filter(appointment => appointment.employeeId === employeeId);
      for (const appointment of employeeAppointments) {
        await deleteAppointmentFromSupabase(appointment.id);
      }
      
      // Then remove the employee
      await deleteEmployeeFromSupabase(employeeId);
      
      // Non aggiornare lo stato qui - sarà aggiornato dal realtime
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
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        const updatedEmployee = { ...employee, name: newName };
        await updateEmployeeInSupabase(updatedEmployee);
        // Non aggiornare lo stato qui - sarà aggiornato dal realtime
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
        // Non aggiornare lo stato qui - sarà aggiornato dal realtime
        toast.success('Ferie aggiornate con successo!');
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle ferie:', error);
      toast.error('Errore nell\'aggiornamento delle ferie');
    }
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
