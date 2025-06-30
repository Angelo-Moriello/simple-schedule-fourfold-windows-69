
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette } from 'lucide-react';
import ClientAutocomplete from './ClientAutocomplete';

interface ClientColorFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  appointmentColors: any[];
}

const ClientColorFields: React.FC<ClientColorFieldsProps> = ({
  formData,
  setFormData,
  appointmentColors
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <ClientAutocomplete
        formData={formData}
        setFormData={setFormData}
      />
      
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
  );
};

export default ClientColorFields;
