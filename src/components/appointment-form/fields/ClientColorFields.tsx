
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
  // Filter out colors without valid values
  const validColors = appointmentColors.filter(color => color.value && color.value.trim() !== '' && color.label && color.label.trim() !== '');

  return (
    <div>
      <Label htmlFor="color" className="text-sm font-medium text-gray-700 mb-1 block">
        Colore
      </Label>
      <Select 
        value={formData.color || (validColors.length > 0 ? validColors[0].value : '')} 
        onValueChange={(value) => setFormData({ ...formData, color: value })}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleziona colore" />
        </SelectTrigger>
        <SelectContent>
          {validColors.length > 0 ? (
            validColors.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300" 
                    style={{ backgroundColor: color.value }}
                  />
                  {color.label}
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="default-color" disabled>
              Nessun colore disponibile
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientColorFields;
