
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types/appointment';
import { User, Clock } from 'lucide-react';

interface EmployeeTimeFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  employees: Employee[];
  timeSlots: string[];
}

const EmployeeTimeFields: React.FC<EmployeeTimeFieldsProps> = ({
  formData,
  setFormData,
  employees,
  timeSlots
}) => {
  return (
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
  );
};

export default EmployeeTimeFields;
