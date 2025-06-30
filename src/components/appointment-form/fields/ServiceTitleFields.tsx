
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types/appointment';
import { Scissors, FileText } from 'lucide-react';

interface ServiceTitleFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  availableServices: string[];
  selectedEmployee: Employee | undefined;
}

const ServiceTitleFields: React.FC<ServiceTitleFieldsProps> = ({
  formData,
  setFormData,
  availableServices,
  selectedEmployee
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Label htmlFor="serviceType" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Scissors className="h-4 w-4 text-purple-600" />
          Tipo di Servizio <span className="text-red-500">*</span> 
          {selectedEmployee && <span className="text-xs text-purple-600 font-normal bg-purple-50 px-2 py-1 rounded-full">({selectedEmployee.specialization})</span>}
        </Label>
        <Select
          value={formData.serviceType}
          onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
          disabled={!selectedEmployee}
        >
          <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white shadow-sm">
            <SelectValue placeholder={selectedEmployee ? "Seleziona servizio" : "Prima seleziona dipendente"} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-xl z-50 max-h-60 overflow-y-auto rounded-xl">
            {availableServices.length > 0 ? (
              availableServices.map(service => (
                <SelectItem key={service} value={service} className="cursor-pointer hover:bg-purple-50 rounded-lg">
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
          <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded-lg">
            ⚠️ Nessun servizio configurato per {selectedEmployee.specialization}
          </p>
        )}
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FileText className="h-4 w-4 text-purple-600" />
          Titolo Appuntamento <span className="text-gray-400 text-xs">(opzionale)</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Es. Consulenza, Riunione..."
          className="h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white shadow-sm"
        />
      </div>
    </div>
  );
};

export default ServiceTitleFields;
