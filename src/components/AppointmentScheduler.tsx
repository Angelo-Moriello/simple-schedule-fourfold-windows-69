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
        
        console.log('DEBUG - Initial data load:', { 
          employees: loadedEmployees.length, 
          appointments: loadedAppointments.length,
          appointmentDetails: loadedAppointments.map(apt => ({
            id: apt.id,
            employeeId: apt.employeeId,
            date: apt.date,
            time: apt.time,
            client: apt.client
          }))
        });
        
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
    console.log('DEBUG - Configurazione realtime subscriptions...');
    
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
          console.log('DEBUG - Realtime appointment change:', payload);
          
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
            
            console.log('DEBUG - Nuovo appuntamento da realtime:', newAppointment);
            
            setAppointments(prev => {
              // Controllo se l'appuntamento esiste già
              const exists = prev.some(apt => apt.id === newAppointment.id);
              console.log('DEBUG - Appuntamento già esistente?', exists);
              
              if (!exists) {
                const updated = [...prev, newAppointment];
                console.log('DEBUG - Appuntamenti dopo INSERT:', updated.length);
                return updated;
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
            
            console.log('DEBUG - Appuntamento aggiornato da realtime:', updatedAppointment);
            
            setAppointments(prev => {
              const updated = prev.map(apt =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
              );
              console.log('DEBUG - Appuntamenti dopo UPDATE:', updated.length);
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            console.log('DEBUG - Appuntamento eliminato da realtime:', payload.old.id);
            
            setAppointments(prev => {
              const updated = prev.filter(apt => apt.id !== payload.old.id);
              console.log('DEBUG - Appuntamenti dopo DELETE:', updated.length);
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('DEBUG - Stato subscription appuntamenti:', status);
      });

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
          console.log('DEBUG - Realtime employee change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newEmployee: Employee = {
              id: payload.new.id,
              name: payload.new.name,
              color: payload.new.color,
              specialization: payload.new.specialization as 'Parrucchiere' | 'Estetista',
              vacations: payload.new.vacations || []
            };
            
            setEmployees(prev => {
              const exists = prev.some(emp => emp.id === newEmployee.id);
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
      .subscribe((status) => {
        console.log('DEBUG - Stato subscription dipendenti:', status);
      });

    return () => {
      console.log('Pulizia subscriptions...');
      supabase.removeChannel(appointmentsChannel);
    };
  }, []);

  // Debug effect per monitorare i cambiamenti di stato
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

  const addAppointment = async (newAppointment: Appointment) => {
    try {
      console.log('DEBUG - Aggiunta appuntamento:', newAppointment);
      await addAppointmentToSupabase(newAppointment);
      setIsAppointmentFormOpen(false);
      toast.success('Appuntamento aggiunto con successo!');
    } catch (error) {
      console.error('Errore nell\'aggiungere l\'appuntamento:', error);
      toast.error('Errore nell\'aggiungere l\'appuntamento');
    }
  };

  const updateAppointment = async (updatedAppointment: Appointment) => {
    try {
      console.log('DEBUG - Aggiornamento appuntamento:', updatedAppointment);
      await updateAppointmentInSupabase(updatedAppointment);
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
      console.log('DEBUG - Eliminazione appuntamento:', appointmentId);
      await deleteAppointmentFromSupabase(appointmentId);
      toast.success('Appuntamento eliminato con successo!');
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'appuntamento:', error);
      toast.error('Errore nell\'eliminazione dell\'appuntamento');
    }
  };

  const addEmployee = async (newEmployee: Employee) => {
    try {
      await addEmployeeToSupabase(newEmployee);
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
      setIsEmployeeFormOpen(false);
      toast.success('Dipendente modificato con successo!');
    } catch (error) {
      console.error('Errore nella modifica del dipendente:', error);
      toast.error('Errore nella modifica del dipendente');
    }
  };

  const deleteEmployee = async (employeeId: number) => {
    try {
      const employeeAppointments = appointments.filter(appointment => appointment.employeeId === employeeId);
      for (const appointment of employeeAppointments) {
        await deleteAppointmentFromSupabase(appointment.id);
      }
      
      await deleteEmployeeFromSupabase(employeeId);
      
      toast.success('Dipendente eliminato con successo!');
    } catch (error) {
      console.error('Errore nell\'eliminazione del dipendente:', error);
      toast.error('Errore nell\'eliminazione del dipendente');
    }
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

  const updateEmployeeName = async (employeeId: number, newName: string) => {
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        const updatedEmployee = { ...employee, name: newName };
        await updateEmployeeInSupabase(updatedEmployee);
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
