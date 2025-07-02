
import React from 'react';
import { Appointment, Employee } from '@/types/appointment';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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
  // Filter out empty services and ensure we have valid values
  const validServices = availableServices.filter(service => service && service.trim() !== '');

  return (
    <>
      <div>
        <Label htmlFor="serviceType" className="text-sm font-medium text-gray-700 mb-1 block">
          Servizio
        </Label>
        <Select 
          value={formData.serviceType || ''} 
          onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleziona servizio" />
          </SelectTrigger>
          <SelectContent>
            {validServices.length > 0 ? (
              validServices.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="servizio-generico" disabled>
                {selectedEmployee 
                  ? `Nessun servizio disponibile per ${selectedEmployee.specialization}`
                  : 'Seleziona prima un dipendente'
                }
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-1 block">
          Titolo (opzionale)
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Titolo appuntamento"
          className="w-full"
        />
      </div>
    </>
  );
};

export default ServiceTitleFields;
