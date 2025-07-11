
import React from 'react';
import { Appointment } from '@/types/appointment';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClientColorFieldsProps {
  formData: Appointment;
  setFormData: (data: Appointment) => void;
  appointmentColors: { label: string; value: string; }[];
}

const ClientColorFields: React.FC<ClientColorFieldsProps> = ({
  formData,
  setFormData,
  appointmentColors
}) => {
  return (
    <div>
      <Label htmlFor="color" className="text-sm font-medium text-gray-700 mb-1 block">
        Colore
      </Label>
      <Select 
        value={formData.color || appointmentColors[0]?.value || ''} 
        onValueChange={(value) => setFormData({ ...formData, color: value })}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleziona colore" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          {appointmentColors.map((color) => (
            <SelectItem key={color.value} value={color.value} className="hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" 
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-gray-700">{color.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientColorFields;
