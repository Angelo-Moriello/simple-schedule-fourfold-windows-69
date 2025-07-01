
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types/appointment';
import { Scissors, FileText } from 'lucide-react';
import { getStoredServices } from '@/utils/serviceStorage';

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
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carica i servizi quando cambia l'employee selezionato
  useEffect(() => {
    const loadServices = async () => {
      if (!selectedEmployee) {
        setAvailableServices([]);
        return;
      }

      setIsLoading(true);
      try {
        console.log('ServiceTitleFields - Caricando servizi per:', selectedEmployee.specialization);
        const services = await getStoredServices();
        const employeeServices = services[selectedEmployee.specialization]?.services || [];
        console.log('ServiceTitleFields - Servizi caricati:', employeeServices);
        setAvailableServices(employeeServices);
      } catch (error) {
        console.error('Errore caricamento servizi:', error);
        setAvailableServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, [selectedEmployee]);

  // Listener per aggiornamenti ai servizi
  useEffect(() => {
    const handleServicesUpdated = async () => {
      if (selectedEmployee) {
        try {
          const services = await getStoredServices();
          const employeeServices = services[selectedEmployee.specialization]?.services || [];
          console.log('ServiceTitleFields - Servizi aggiornati via evento per:', selectedEmployee.specialization, employeeServices);
          setAvailableServices(employeeServices);
        } catch (error) {
          console.error('Errore aggiornamento servizi:', error);
        }
      }
    };

    window.addEventListener('servicesUpdated', handleServicesUpdated);

    return () => {
      window.removeEventListener('servicesUpdated', handleServicesUpdated);
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
          disabled={!selectedEmployee || isLoading}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder={
              !selectedEmployee 
                ? "Prima seleziona dipendente" 
                : isLoading
                ? "Caricamento servizi..."
                : "Seleziona servizio"
            } />
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
                {isLoading ? "Caricamento..." : "Nessun servizio disponibile"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {selectedEmployee && availableServices.length === 0 && !isLoading && (
          <p className="text-xs text-red-500 mt-1 bg-red-50 p-2 rounded">
            ⚠️ Nessun servizio configurato per {selectedEmployee.specialization}. Controlla le impostazioni servizi.
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
