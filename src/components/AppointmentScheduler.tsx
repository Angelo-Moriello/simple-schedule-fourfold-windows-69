
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { Appointment, Employee } from '@/types/appointment';
import { toast } from '@/hooks/use-toast';

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

  const getAppointmentsForEmployee = (employeeId: number) => {
    return appointments.filter(apt => 
      apt.employeeId === employeeId && apt.date === dateKey
    ).sort((a, b) => a.time.localeCompare(b.time));
  };

  const isTimeSlotOccupied = (employeeId: number, time: string) => {
    return appointments.some(apt => 
      apt.employeeId === employeeId && 
      apt.date === dateKey && 
      apt.time === time
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handlePrevDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Oggi
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-4 gap-4">
          {employees.map(employee => (
            <Card key={employee.id} className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-center font-medium text-gray-700">
                  {employee.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {timeSlots.map(time => {
                  const appointment = appointments.find(apt => 
                    apt.employeeId === employee.id && 
                    apt.date === dateKey && 
                    apt.time === time
                  );

                  return (
                    <div key={time} className="relative">
                      <div className="flex items-center text-xs text-gray-400 mb-1">
                        {time}
                      </div>
                      {appointment ? (
                        <div className={`${employee.color} rounded-lg p-3 border-2 border-dashed relative group`}>
                          <div className="font-medium text-sm text-gray-800">
                            {appointment.title}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {appointment.client}
                          </div>
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleEditAppointment(appointment)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          className="w-full h-12 border-2 border-dashed border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600"
                          onClick={() => handleAddAppointment(employee.id, time)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Appointment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee">Dipendente</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona dipendente" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Orario</Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona orario" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Titolo Appuntamento</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Es. Consulenza, Riunione..."
                />
              </div>

              <div>
                <Label htmlFor="client">Cliente</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                  placeholder="Nome del cliente"
                />
              </div>

              <div>
                <Label htmlFor="duration">Durata (minuti)</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minuti</SelectItem>
                    <SelectItem value="30">30 minuti</SelectItem>
                    <SelectItem value="45">45 minuti</SelectItem>
                    <SelectItem value="60">1 ora</SelectItem>
                    <SelectItem value="90">1.5 ore</SelectItem>
                    <SelectItem value="120">2 ore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Note (opzionale)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Note aggiuntive..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annulla
                </Button>
                <Button type="submit">
                  {editingAppointment ? 'Salva Modifiche' : 'Crea Appuntamento'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
