
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types/appointment';
import { Scissors, FileText } from 'lucide-react';
import { getStoredServices, refreshServices } from '@/utils/serviceStorage';

interface ServiceTitleFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  availableServices: string[];
  selectedEmployee: Employee | undefined;
}

const ServiceTitleFields: React.FC<ServiceTitleFieldsProps> = ({
  formData,
  setFormData,
  availableServices: initialAvailableServices,
  selectedEmployee
}) => {
  const [availableServices, setAvailableServices] = useState(initialAvailableServices);

  // Aggiorna i servizi disponibili quando cambiano i servizi o l'employee selezionato
  useEffect(() => {
    if (selectedEmployee) {
      const services = refreshServices();
      const employeeServices = services[selectedEmployee.specialization]?.services || [];
      console.log('ServiceTitleFields - Aggiornando servizi per:', selectedEmployee.specialization, employeeServices);
      setAvailableServices(employeeServices);
    } else {
      setAvailableServices([]);
    }
  }, [selectedEmployee]);

  // Listener per aggiornamenti ai servizi - più aggressivo
  useEffect(() => {
    const handleServicesUpdated = () => {
      if (selectedEmployee) {
        const services = refreshServices();
        const employeeServices = services[selectedEmployee.specialization]?.services || [];
        console.log('ServiceTitleFields - Servizi aggiornati via evento per:', selectedEmployee.specialization, employeeServices);
        setAvailableServices(employeeServices);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if ((event.key === 'services' || event.key === 'customServices' || event.key === null) && selectedEmployee) {
        const services = refreshServices();
        const employeeServices = services[selectedEmployee.specialization]?.services || [];
        console.log('ServiceTitleFields - Servizi aggiornati via storage per:', selectedEmployee.specialization, employeeServices);
        setAvailableServices(employeeServices);
      }
    };

    const handleFocus = () => {
      if (selectedEmployee) {
        const services = refreshServices();
        const employeeServices = services[selectedEmployee.specialization]?.services || [];
        console.log('ServiceTitleFields - Servizi aggiornati via focus per:', selectedEmployee.specialization, employeeServices);
        setAvailableServices(employeeServices);
      }
    };

    window.addEventListener('servicesUpdated', handleServicesUpdated);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('servicesUpdated', handleServicesUpdated);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedEmployee]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="serviceType" className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Scissors className="h-4 w-4 text-purple-600" />
          Tipo di Servizio <span className="text-red-500">*</span> 
          {selectedEmployee && <span className="text-xs text-purple-600 font-normal bg-purple-50 px-2 py-1 rounded-full ml-2">({selectedEmployee.specialization})</span>}
        </Label>
        <Select
          value={formData.serviceType}
          onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
          disabled={!selectedEmployee}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder={selectedEmployee ? "Seleziona servizio" : "Prima seleziona dipendente"} />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
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
              <SelectItem value="no-services" disabled className="text-gray-400">
                Nessun servizio disponibile
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {selectedEmployee && availableServices.length === 0 && (
          <p className="text-xs text-red-500 mt-1 bg-red-50 p-2 rounded">
            ⚠️ Nessun servizio configurato per {selectedEmployee.specialization}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="h-4 w-4 text-purple-600" />
          Titolo Appuntamento <span className="text-gray-400 text-xs">(opzionale)</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Es. Consulenza, Riunione..."
          className="h-11"
        />
      </div>
    </div>
  );
};

export default ServiceTitleFields;
