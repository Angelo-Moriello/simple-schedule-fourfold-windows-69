
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee, Appointment } from '@/types/appointment';
import { Scissors, FileText } from 'lucide-react';

interface ServiceTitleFieldsProps {
  formData: Appointment;
  setFormData: (data: Appointment) => void;
  availableServices: string[];
  selectedEmployee?: Employee;
}

const ServiceTitleFields: React.FC<ServiceTitleFieldsProps> = ({
  formData,
  setFormData,
  availableServices,
  selectedEmployee
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="serviceType" className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Scissors className="h-4 w-4 text-purple-600" />
          Tipo Servizio <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.serviceType}
          onValueChange={(value) => {
            setFormData({ ...formData, serviceType: value });
          }}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Seleziona servizio" />
          </SelectTrigger>
          <SelectContent>
            {availableServices.length > 0 ? (
              availableServices.map(service => (
                <SelectItem key={service} value={service}>
                  <div className="flex items-center gap-2">
                    <Scissors className="h-3 w-3 text-purple-400" />
                    {service}
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>
                {selectedEmployee ? 'Nessun servizio disponibile' : 'Seleziona prima un dipendente'}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4 text-purple-600" />
          Titolo Appuntamento
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Inserisci titolo personalizzato..."
          className="h-11"
        />
      </div>
    </>
  );
};

export default ServiceTitleFields;
