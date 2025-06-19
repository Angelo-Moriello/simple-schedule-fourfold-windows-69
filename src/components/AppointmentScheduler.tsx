import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Appointment, Employee } from '@/types/appointment';
import { getOccupiedSlots, isSlotOccupied } from '@/utils/timeSlotUtils';
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
import TimeSlot from './TimeSlot';
import AppointmentForm from './AppointmentForm';
import EmployeeForm from './EmployeeForm';
import EmployeeNameEditor from './EmployeeNameEditor';
import { toast } from 'sonner';

const AppointmentScheduler = () => {
  const navigate = useNavigate();
  
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
            // Clear localStorage after successful migration
            localStorage.removeItem('employees');
            localStorage.removeItem('appointments');
            localStorage.removeItem('employeesTimestamp');
            localStorage.removeItem('appointmentsTimestamp');
            toast.success('Dati migrati con successo su Supabase!');
          }
        }
        
        // Load current data from Supabase
        const [loadedEmployees, loadedAppointments] = await Promise.all([
          loadEmployeesFromSupabase(),
          loadAppointmentsFromSupabase()
        ]);
        
        setEmployees(loadedEmployees);
        setAppointments(loadedAppointments);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        toast.error('Errore nel caricamento dei dati');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowFullCalendar(false);
  };

  const addAppointment = async (newAppointment: Appointment) => {
    try {
      await addAppointmentToSupabase(newAppointment);
      setAppointments([...appointments, newAppointment]);
      setIsAppointmentFormOpen(false);
      toast.success('Appuntamento aggiunto con successo!');
    } catch (error) {
      toast.error('Errore nell\'aggiungere l\'appuntamento');
    }
  };

  const updateAppointment = async (updatedAppointment: Appointment) => {
    try {
      await updateAppointmentInSupabase(updatedAppointment);
      const updatedAppointments = appointments.map(appointment =>
        appointment.id === updatedAppointment.id ? updatedAppointment : appointment
      );
      setAppointments(updatedAppointments);
      setAppointmentToEdit(null);
      setIsAppointmentFormOpen(false);
      toast.success('Appuntamento modificato con successo!');
    } catch (error) {
      toast.error('Errore nella modifica dell\'appuntamento');
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointmentFromSupabase(appointmentId);
      const updatedAppointments = appointments.filter(appointment => appointment.id !== appointmentId);
      setAppointments(updatedAppointments);
      toast.success('Appuntamento eliminato con successo!');
    } catch (error) {
      toast.error('Errore nell\'eliminazione dell\'appuntamento');
    }
  };

  const addEmployee = async (newEmployee: Employee) => {
    try {
      await addEmployeeToSupabase(newEmployee);
      setEmployees([...employees, newEmployee]);
      setIsEmployeeFormOpen(false);
      toast.success('Dipendente aggiunto con successo!');
    } catch (error) {
      toast.error('Errore nell\'aggiungere il dipendente');
    }
  };

  const updateEmployee = async (updatedEmployee: Employee) => {
    try {
      await updateEmployeeInSupabase(updatedEmployee);
      const updatedEmployees = employees.map(employee =>
        employee.id === updatedEmployee.id ? updatedEmployee : employee
      );
      setEmployees(updatedEmployees);
      setIsEmployeeFormOpen(false);
      toast.success('Dipendente modificato con successo!');
    } catch (error) {
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
      
      const updatedAppointments = appointments.filter(appointment => appointment.employeeId !== employeeId);
      const updatedEmployees = employees.filter(employee => employee.id !== employeeId);
      
      setAppointments(updatedAppointments);
      setEmployees(updatedEmployees);
      toast.success('Dipendente eliminato con successo!');
    } catch (error) {
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

  const isVacationDay = useCallback((employeeId: number, date: Date): boolean => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee || !employee.vacations) {
      return false;
    }
    const dateString = format(date, 'yyyy-MM-dd');
    return employee.vacations.includes(dateString);
  }, [employees]);

  const getEmployeeAppointmentsForTimeSlot = (employeeId: number, time: string) => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return appointments.find(
      appointment => appointment.employeeId === employeeId && appointment.date === dateString && appointment.time === time
    );
  };

  const updateEmployeeName = async (employeeId: number, newName: string) => {
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        const updatedEmployee = { ...employee, name: newName };
        await updateEmployeeInSupabase(updatedEmployee);
        const updatedEmployees = employees.map(emp =>
          emp.id === employeeId ? updatedEmployee : emp
        );
        setEmployees(updatedEmployees);
        toast.success('Nome dipendente aggiornato con successo!');
      }
    } catch (error) {
      toast.error('Errore nell\'aggiornamento del nome');
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 19; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`);
      slots.push(`${String(i).padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dati...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img 
                src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
                alt="Da Capo a Piedi - Estetica & Parrucchieri" 
                className="h-12 w-12 sm:h-16 sm:w-16 object-contain rounded-lg shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Calendario Appuntamenti
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: it })}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={() => navigate('/history')}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 h-10 sm:h-12 px-4 sm:px-6"
              >
                <Clock className="h-4 w-4 mr-2" />
                Storico
              </Button>
              <Button 
                onClick={() => setShowFullCalendar(true)}
                variant="outline"
                className="w-full sm:w-auto h-10 sm:h-12 px-4 sm:px-6"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Vista Mese
              </Button>
            </div>
          </div>
        </div>

        {/* Management buttons */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow-md mb-6">
          <div className="flex items-center gap-3">
            <Popover open={showFullCalendar} onOpenChange={setShowFullCalendar}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 px-3">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Seleziona Data</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  captionLayout="dropdown"
                  defaultMonth={selectedDate}
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border-0"
                  style={{ width: '100%' }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleOpenEmployeeForm} className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3">
            Gestisci Dipendenti
          </Button>
        </div>

        {/* Employee Time Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map(employee => (
            <Card key={employee.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 mb-4">
                  {/* Employee name with inline editing */}
                  <EmployeeNameEditor
                    employee={employee}
                    onUpdateName={updateEmployeeName}
                  />
                  
                  {/* Specialization selector */}
                  <Select 
                    onValueChange={(value) => {
                      const updatedEmployee = { ...employee, specialization: value as 'Parrucchiere' | 'Estetista' };
                      updateEmployee(updatedEmployee);
                    }} 
                    defaultValue={employee.specialization}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Parrucchiere">Parrucchiere</SelectItem>
                      <SelectItem value="Estetista">Estetista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time slots grid */}
                <div className="grid grid-cols-1 gap-2">
                  {timeSlots.map(time => {
                    const appointment = getEmployeeAppointmentsForTimeSlot(employee.id, time);
                    const occupiedSlots = getOccupiedSlots(appointments, employee.id, format(selectedDate, 'yyyy-MM-dd'));
                    const isOccupied = isSlotOccupied(time, occupiedSlots);
                    const vacation = isVacationDay(employee.id, selectedDate);

                    return (
                      <TimeSlot
                        key={`${employee.id}-${time}`}
                        time={time}
                        appointment={appointment}
                        employee={employee}
                        onAddAppointment={handleOpenAppointmentForm}
                        onEditAppointment={handleEditAppointment}
                        onDeleteAppointment={deleteAppointment}
                        isVacationDay={vacation}
                        isOccupied={isOccupied}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Appointment Form Modal */}
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

        {/* Employee Form Modal */}
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
