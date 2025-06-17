
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Appointment, Employee } from '@/types/appointment';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingAppointment: Appointment | null;
  formData: {
    employeeId: string;
    time: string;
    title: string;
    client: string;
    duration: string;
    notes: string;
    email: string;
    phone: string;
    color: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  employees: Employee[];
  timeSlots: string[];
}

const appointmentColors = [
  { label: 'Blu', value: 'bg-blue-100 border-blue-300 text-blue-800' },
  { label: 'Verde', value: 'bg-green-100 border-green-300 text-green-800' },
  { label: 'Giallo', value: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { label: 'Rosso', value: 'bg-red-100 border-red-300 text-red-800' },
  { label: 'Viola', value: 'bg-purple-100 border-purple-300 text-purple-800' },
  { label: 'Rosa', value: 'bg-pink-100 border-pink-300 text-pink-800' },
  { label: 'Arancione', value: 'bg-orange-100 border-orange-300 text-orange-800' },
  { label: 'Grigio', value: 'bg-gray-100 border-gray-300 text-gray-800' }
];

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingAppointment,
  formData,
  onFormDataChange,
  employees,
  timeSlots
}) => {
  const handleGoogleCalendarSync = () => {
    const startDate = new Date(`${new Date().toISOString().split('T')[0]}T${formData.time}:00`);
    const endDate = new Date(startDate.getTime() + parseInt(formData.duration) * 60000);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(formData.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Cliente: ${formData.client}\nEmail: ${formData.email}\nTelefono: ${formData.phone}\nNote: ${formData.notes}`)}&location=${encodeURIComponent('Studio')}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center sm:text-left">
            {editingAppointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee">Dipendente</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => onFormDataChange('employeeId', value)}
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
                onValueChange={(value) => onFormDataChange('time', value)}
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
              onChange={(e) => onFormDataChange('title', e.target.value)}
              placeholder="Es. Consulenza, Riunione..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Cliente</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => onFormDataChange('client', e.target.value)}
                placeholder="Nome del cliente"
              />
            </div>
            <div>
              <Label htmlFor="color">Colore Etichetta</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => onFormDataChange('color', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona colore" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentColors.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color.value}`}></div>
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Cliente</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onFormDataChange('email', e.target.value)}
                placeholder="email@esempio.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefono Cliente</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormDataChange('phone', e.target.value)}
                placeholder="+39 123 456 7890"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Durata (minuti)</Label>
            <Select
              value={formData.duration}
              onValueChange={(value) => onFormDataChange('duration', value)}
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
              onChange={(e) => onFormDataChange('notes', e.target.value)}
              placeholder="Note aggiuntive..."
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleCalendarSync}
              className="text-blue-600 border-blue-600 hover:bg-blue-50 w-full sm:w-auto"
            >
              Aggiungi a Google Calendar
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Annulla
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {editingAppointment ? 'Salva Modifiche' : 'Crea Appuntamento'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;
