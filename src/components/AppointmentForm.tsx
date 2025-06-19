
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Appointment, Employee, ServiceCategory } from '@/types/appointment';
import { Calendar, Clock, User, Mail, Phone, Palette, FileText, ExternalLink, Scissors } from 'lucide-react';

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
    serviceType: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  employees: Employee[];
  timeSlots: string[];
  serviceCategories: Record<'Parrucchiere' | 'Estetista', ServiceCategory>;
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
  timeSlots,
  serviceCategories
}) => {
  const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employeeId));
  const availableServices = selectedEmployee && serviceCategories[selectedEmployee.specialization] 
    ? serviceCategories[selectedEmployee.specialization].services 
    : [];

  const handleGoogleCalendarSync = () => {
    const startDate = new Date(`${new Date().toISOString().split('T')[0]}T${formData.time}:00`);
    const endDate = new Date(startDate.getTime() + parseInt(formData.duration) * 60000);
    
    const title = formData.title || `${formData.serviceType} - ${formData.client}`;
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Cliente: ${formData.client}\nServizio: ${formData.serviceType}\nEmail: ${formData.email}\nTelefono: ${formData.phone}\nNote: ${formData.notes}`)}&location=${encodeURIComponent('Studio')}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl sm:rounded-3xl">
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {editingAppointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="employee" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="h-4 w-4" />
                Dipendente <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => {
                  onFormDataChange('employeeId', value);
                  onFormDataChange('serviceType', ''); // Reset service when changing employee
                }}
              >
                <SelectTrigger className="h-10 sm:h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder="Seleziona dipendente" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} ({employee.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock className="h-4 w-4" />
                Orario <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.time}
                onValueChange={(value) => onFormDataChange('time', value)}
              >
                <SelectTrigger className="h-10 sm:h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="serviceType" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Scissors className="h-4 w-4" />
                Tipo di Servizio <span className="text-red-500">*</span> {selectedEmployee && `(${selectedEmployee.specialization})`}
              </Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => onFormDataChange('serviceType', value)}
                disabled={!selectedEmployee}
              >
                <SelectTrigger className="h-10 sm:h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder={selectedEmployee ? "Seleziona servizio" : "Prima seleziona dipendente"} />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map(service => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="h-4 w-4" />
                Titolo Appuntamento (opzionale)
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => onFormDataChange('title', e.target.value)}
                placeholder="Es. Consulenza, Riunione..."
                className="h-10 sm:h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="client" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="h-4 w-4" />
                Cliente <span className="text-red-500">*</span>
              </Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => onFormDataChange('client', e.target.value)}
                placeholder="Nome del cliente"
                className="h-10 sm:h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Palette className="h-4 w-4" />
                Colore Etichetta
              </Label>
              <Select
                value={formData.color}
                onValueChange={(value) => onFormDataChange('color', value)}
              >
                <SelectTrigger className="h-10 sm:h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder="Seleziona colore" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentColors.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${color.value}`}></div>
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Mail className="h-4 w-4" />
                Email Cliente
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onFormDataChange('email', e.target.value)}
                placeholder="email@esempio.com"
                className="h-10 sm:h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Phone className="h-4 w-4" />
                Telefono Cliente
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormDataChange('phone', e.target.value)}
                placeholder="+39 123 456 7890"
                className="h-10 sm:h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Clock className="h-4 w-4" />
              Durata (minuti) <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.duration}
              onValueChange={(value) => onFormDataChange('duration', value)}
            >
              <SelectTrigger className="h-10 sm:h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
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

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText className="h-4 w-4" />
              Note (opzionale)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => onFormDataChange('notes', e.target.value)}
              placeholder="Note aggiuntive..."
              rows={3}
              className="rounded-xl border-gray-200 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-4 pt-4 sm:pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleCalendarSync}
              className="w-full sm:w-auto h-10 sm:h-12 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Aggiungi a Google Calendar
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto h-10 sm:h-12 px-6 sm:px-8 rounded-xl border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Annulla
              </Button>
              <Button 
                type="submit"
                className="w-full sm:w-auto h-10 sm:h-12 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
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
