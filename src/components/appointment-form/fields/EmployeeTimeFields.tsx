
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Label htmlFor="employee" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <User className="h-4 w-4 text-blue-600" />
          Dipendente <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.employeeId}
          onValueChange={(value) => {
            setFormData({ ...formData, employeeId: value, serviceType: '' });
          }}
        >
          <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm">
            <SelectValue placeholder="Seleziona dipendente" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-xl z-50 rounded-xl">
            {employees.map(employee => (
              <SelectItem key={employee.id} value={employee.id.toString()} className="cursor-pointer hover:bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {employee.name} <span className="text-gray-500 text-xs">({employee.specialization})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="time" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Clock className="h-4 w-4 text-blue-600" />
          Orario <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.time}
          onValueChange={(value) => setFormData({ ...formData, time: value })}
        >
          <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm">
            <SelectValue placeholder="Seleziona orario" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-xl z-50 max-h-60 overflow-y-auto rounded-xl">
            {timeSlots.map(time => (
              <SelectItem key={time} value={time} className="cursor-pointer hover:bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  {time}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EmployeeTimeFields;
