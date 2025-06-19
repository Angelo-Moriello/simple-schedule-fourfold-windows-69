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
import { Appointment, Employee, ServiceCategory, serviceCategories } from '@/types/appointment';
import { getOccupiedSlots, isSlotOccupied } from '@/utils/timeSlotUtils';
import TimeSlot from './TimeSlot';
import AppointmentForm from './AppointmentForm';
import EmployeeForm from './EmployeeForm';
import { toast } from 'sonner';
import BackupManager from './BackupManager';

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

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedAppointments = localStorage.getItem('appointments');
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    }

    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }
  }, []);

  // Save appointments to localStorage whenever appointments change
  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Save employees to localStorage whenever employees change
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowFullCalendar(false);
  };

  const addAppointment = (newAppointment: Appointment) => {
    setAppointments([...appointments, newAppointment]);
    setIsAppointmentFormOpen(false);
    toast.success('Appuntamento aggiunto con successo!');
  };

  const updateAppointment = (updatedAppointment: Appointment) => {
    const updatedAppointments = appointments.map(appointment =>
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    );
    setAppointments(updatedAppointments);
    setAppointmentToEdit(null);
    setIsAppointmentFormOpen(false);
    toast.success('Appuntamento modificato con successo!');
  };

  const deleteAppointment = (appointmentId: string) => {
    const updatedAppointments = appointments.filter(appointment => appointment.id !== appointmentId);
    setAppointments(updatedAppointments);
    toast.success('Appuntamento eliminato con successo!');
  };

  const addEmployee = (newEmployee: Employee) => {
    setEmployees([...employees, newEmployee]);
    setIsEmployeeFormOpen(false);
    toast.success('Dipendente aggiunto con successo!');
  };

   const updateEmployee = (updatedEmployee: Employee) => {
    const updatedEmployees = employees.map(employee =>
      employee.id === updatedEmployee.id ? updatedEmployee : employee
    );
    setEmployees(updatedEmployees);
    setIsEmployeeFormOpen(false);
    toast.success('Dipendente modificato con successo!');
  };

  const deleteEmployee = (employeeId: number) => {
    // Remove employee's appointments first
    const updatedAppointments = appointments.filter(appointment => appointment.employeeId !== employeeId);
    setAppointments(updatedAppointments);

    // Then remove the employee
    const updatedEmployees = employees.filter(employee => employee.id !== employeeId);
    setEmployees(updatedEmployees);
    toast.success('Dipendente eliminato con successo!');
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Dipendente non trovato';
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

  const getAppointmentsForDay = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.filter(appointment => appointment.date === dateString);
  };

  const getEmployeeAppointmentsForTimeSlot = (employeeId: number, time: string) => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return appointments.find(
      appointment => appointment.employeeId === employeeId && appointment.date === dateString && appointment.time === time
    );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header with enhanced controls */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Calendario Appuntamenti
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: it })}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <BackupManager />
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

          {/* Management buttons */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow-md">
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
        </div>

        {/* Employee Time Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(employee => (
            <Card key={employee.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">{employee.name}</h2>
                  <Select onValueChange={(value) => {
                      const updatedEmployees = employees.map(emp => {
                        if (emp.id === employee.id) {
                          return { ...emp, specialization: value as 'Parrucchiere' | 'Estetista' };
                        }
                        return emp;
                      });
                      setEmployees(updatedEmployees);
                    }} defaultValue={employee.specialization}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleziona Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Parrucchiere">Parrucchiere</SelectItem>
                      <SelectItem value="Estetista">Estetista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
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
                <Button
                  variant="destructive"
                  onClick={() => deleteEmployee(employee.id)}
                  className="mt-4 w-full"
                >
                  Elimina Dipendente
                </Button>
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
