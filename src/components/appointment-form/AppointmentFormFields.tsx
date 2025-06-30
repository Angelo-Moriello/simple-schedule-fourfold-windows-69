
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types/appointment';
import { Calendar, Clock, User, Mail, Phone, Palette, FileText, Scissors } from 'lucide-react';

interface AppointmentFormFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  employees: Employee[];
  timeSlots: string[];
  appointmentColors: any[];
  availableServices: string[];
  selectedEmployee: Employee | undefined;
  appointmentToEdit: any;
}

const AppointmentFormFields: React.FC<AppointmentFormFieldsProps> = ({
  formData,
  setFormData,
  employees,
  timeSlots,
  appointmentColors,
  availableServices,
  selectedEmployee,
  appointmentToEdit
}) => {
  // Debug log per verificare i servizi disponibili
  console.log('DEBUG - Servizi disponibili nel form:', {
    selectedEmployee,
    specialization: selectedEmployee?.specialization,
    availableServices,
    availableServicesCount: availableServices.length
  });

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label htmlFor="employee" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <User className="h-4 w-4" />
            Dipendente <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.employeeId}
            onValueChange={(value) => {
              setFormData({ ...formData, employeeId: value, serviceType: '' });
            }}
          >
            <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
              <SelectValue placeholder="Seleziona dipendente" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
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
            onValueChange={(value) => setFormData({ ...formData, time: value })}
          >
            <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
              <SelectValue placeholder="Seleziona orario" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60 overflow-y-auto">
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
            Tipo di Servizio <span className="text-red-500">*</span> 
            {selectedEmployee && <span className="text-xs text-blue-600 font-normal">({selectedEmployee.specialization})</span>}
          </Label>
          <Select
            value={formData.serviceType}
            onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
            disabled={!selectedEmployee}
          >
            <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
              <SelectValue placeholder={selectedEmployee ? "Seleziona servizio" : "Prima seleziona dipendente"} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60 overflow-y-auto">
              {availableServices.length > 0 ? (
                availableServices.map(service => (
                  <SelectItem key={service} value={service} className="cursor-pointer hover:bg-gray-50">
                    {service}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-services" disabled className="text-gray-400">
                  Nessun servizio disponibile
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {selectedEmployee && availableServices.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              Nessun servizio configurato per {selectedEmployee.specialization}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FileText className="h-4 w-4" />
            Titolo Appuntamento (opzionale)
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Es. Consulenza, Riunione..."
            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
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
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            placeholder="Nome del cliente"
            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="color" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Palette className="h-4 w-4" />
            Colore Etichetta
          </Label>
          <Select
            value={formData.color}
            onValueChange={(value) => setFormData({ ...formData, color: value })}
          >
            <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
              <SelectValue placeholder="Seleziona colore" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
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
            {!appointmentToEdit && (
              <span className="text-xs text-blue-600 font-normal">(collegherà il cliente esistente o ne creerà uno nuovo)</span>
            )}
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@esempio.com"
            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Phone className="h-4 w-4" />
            Telefono Cliente
            {!appointmentToEdit && (
              <span className="text-xs text-blue-600 font-normal">(collegherà il cliente esistente o ne creerà uno nuovo)</span>
            )}
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+39 123 456 7890"
            className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
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
          onValueChange={(value) => setFormData({ ...formData, duration: value })}
        >
          <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
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
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Note aggiuntive..."
          rows={3}
          className="rounded-xl border-gray-200 focus:border-blue-500 transition-colors resize-none"
        />
      </div>
    </>
  );
};

export default AppointmentFormFields;
