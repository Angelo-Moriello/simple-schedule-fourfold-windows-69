import React, { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { Appointment, Employee } from '@/types/appointment';
import { toast } from '@/hooks/use-toast';
import FullCalendar from './FullCalendar';
import AppointmentForm from './AppointmentForm';
import EmployeeColumn from './EmployeeColumn';
import DateNavigation from './DateNavigation';
import EmployeeManager from './EmployeeManager';

const defaultEmployees: Employee[] = [
  { id: 1, name: 'Marco Rossi', color: 'bg-blue-100 border-blue-300' },
  { id: 2, name: 'Anna Verdi', color: 'bg-green-100 border-green-300' },
  { id: 3, name: 'Luca Bianchi', color: 'bg-yellow-100 border-yellow-300' },
  { id: 4, name: 'Sara Neri', color: 'bg-purple-100 border-purple-300' }
];

const employeeColors = [
  'bg-blue-100 border-blue-300',
  'bg-green-100 border-green-300',
  'bg-yellow-100 border-yellow-300',
  'bg-purple-100 border-purple-300',
  'bg-pink-100 border-pink-300',
  'bg-indigo-100 border-indigo-300',
  'bg-orange-100 border-orange-300',
  'bg-teal-100 border-teal-300'
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
];

const AppointmentScheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(defaultEmployees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    time: '',
    title: '',
    client: '',
    duration: '30',
    notes: '',
    email: '',
    phone: '',
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  });

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedAppointments = localStorage.getItem('appointments');
    const savedEmployees = localStorage.getItem('employees');
    
    if (savedAppointments) {
      try {
        setAppointments(JSON.parse(savedAppointments));
      } catch (error) {
        console.error('Error loading appointments from localStorage:', error);
      }
    }
    
    if (savedEmployees) {
      try {
        setEmployees(JSON.parse(savedEmployees));
      } catch (error) {
        console.error('Error loading employees from localStorage:', error);
      }
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

  const handlePrevDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      time: '',
      title: '',
      client: '',
      duration: '30',
      notes: '',
      email: '',
      phone: '',
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    });
    setEditingAppointment(null);
  };

  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddEmployee = (name: string) => {
    const newId = Math.max(...employees.map(e => e.id), 0) + 1;
    const colorIndex = employees.length % employeeColors.length;
    const newEmployee: Employee = {
      id: newId,
      name,
      color: employeeColors[colorIndex]
    };
    setEmployees(prev => [...prev, newEmployee]);
    toast({
      title: "Dipendente aggiunto",
      description: `${name} è stato aggiunto con successo.`,
    });
  };

  const handleRemoveEmployee = (employeeId: number) => {
    if (employees.length <= 1) {
      toast({
        title: "Errore",
        description: "Deve esserci almeno un dipendente.",
        variant: "destructive"
      });
      return;
    }
    
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    setAppointments(prev => prev.filter(apt => apt.employeeId !== employeeId));
    toast({
      title: "Dipendente rimosso",
      description: "Il dipendente e tutti i suoi appuntamenti sono stati rimossi.",
    });
  };

  const handleBackupData = () => {
    const data = {
      appointments,
      employees,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenda-backup-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Backup creato",
      description: "I dati sono stati salvati con successo.",
    });
  };

  const handleRestoreData = (data: any) => {
    try {
      if (data.appointments && data.employees) {
        setAppointments(data.appointments);
        setEmployees(data.employees);
        toast({
          title: "Backup ripristinato",
          description: "I dati sono stati ripristinati con successo.",
        });
      } else {
        throw new Error('Formato file non valido');
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile ripristinare il backup. Verifica il formato del file.",
        variant: "destructive"
      });
    }
  };

  const handleAddAppointment = (employeeId: number, time: string) => {
    setFormData(prev => ({
      ...prev,
      employeeId: employeeId.toString(),
      time
    }));
    setIsDialogOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      employeeId: appointment.employeeId.toString(),
      time: appointment.time,
      title: appointment.title,
      client: appointment.client,
      duration: appointment.duration.toString(),
      notes: appointment.notes || '',
      email: appointment.email || '',
      phone: appointment.phone || '',
      color: appointment.color
    });
    setIsDialogOpen(true);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    toast({
      title: "Appuntamento eliminato",
      description: "L'appuntamento è stato rimosso con successo.",
    });
  };

  const handleUpdateEmployeeName = (employeeId: number, newName: string) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId ? { ...emp, name: newName } : emp
    ));
    toast({
      title: "Nome dipendente aggiornato",
      description: `Il nome è stato cambiato in "${newName}".`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.time || !formData.title || !formData.client) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori.",
        variant: "destructive"
      });
      return;
    }

    const newAppointment: Appointment = {
      id: editingAppointment?.id || Date.now().toString(),
      employeeId: parseInt(formData.employeeId),
      date: dateKey,
      time: formData.time,
      title: formData.title,
      client: formData.client,
      duration: parseInt(formData.duration),
      notes: formData.notes,
      email: formData.email,
      phone: formData.phone,
      color: formData.color
    };

    if (editingAppointment) {
      setAppointments(prev => prev.map(apt => 
        apt.id === editingAppointment.id ? newAppointment : apt
      ));
      toast({
        title: "Appuntamento modificato",
        description: "L'appuntamento è stato aggiornato con successo.",
      });
    } else {
      setAppointments(prev => [...prev, newAppointment]);
      toast({
        title: "Appuntamento aggiunto",
        description: "Il nuovo appuntamento è stato creato con successo.",
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleCalendarDateSelect = (date: Date) => {
    setCurrentDate(date);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
          <DateNavigation
            currentDate={currentDate}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onToday={handleToday}
            onOpenCalendar={() => setIsCalendarOpen(true)}
          />
          <EmployeeManager
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onRemoveEmployee={handleRemoveEmployee}
            onBackupData={handleBackupData}
            onRestoreData={handleRestoreData}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employees.map(employee => (
            <EmployeeColumn
              key={employee.id}
              employee={employee}
              appointments={appointments}
              timeSlots={timeSlots}
              dateKey={dateKey}
              onAddAppointment={handleAddAppointment}
              onEditAppointment={handleEditAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onUpdateEmployeeName={handleUpdateEmployeeName}
            />
          ))}
        </div>

        <AppointmentForm
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          editingAppointment={editingAppointment}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          employees={employees}
          timeSlots={timeSlots}
        />

        <FullCalendar
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          appointments={appointments}
          employees={employees}
          onDateSelect={handleCalendarDateSelect}
        />
      </div>
    </div>
  );
};

export default AppointmentScheduler;
