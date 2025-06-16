
import React, { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { Appointment, Employee } from '@/types/appointment';
import { toast } from '@/hooks/use-toast';
import FullCalendar from './FullCalendar';
import AppointmentForm from './AppointmentForm';
import EmployeeColumn from './EmployeeColumn';
import DateNavigation from './DateNavigation';

const employees: Employee[] = [
  { id: 1, name: 'Marco Rossi', color: 'bg-blue-100 border-blue-300' },
  { id: 2, name: 'Anna Verdi', color: 'bg-green-100 border-green-300' },
  { id: 3, name: 'Luca Bianchi', color: 'bg-yellow-100 border-yellow-300' },
  { id: 4, name: 'Sara Neri', color: 'bg-purple-100 border-purple-300' }
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

const AppointmentScheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    time: '',
    title: '',
    client: '',
    duration: '30',
    notes: ''
  });

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  // Load appointments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('appointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
  }, []);

  // Save appointments to localStorage
  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

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
      notes: ''
    });
    setEditingAppointment(null);
  };

  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      notes: appointment.notes || ''
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
      notes: formData.notes
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <DateNavigation
          currentDate={currentDate}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onToday={handleToday}
          onOpenCalendar={() => setIsCalendarOpen(true)}
        />

        {/* Calendar Grid */}
        <div className="grid grid-cols-4 gap-4">
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
            />
          ))}
        </div>

        {/* Add/Edit Appointment Dialog */}
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

        {/* Full Calendar Dialog */}
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
