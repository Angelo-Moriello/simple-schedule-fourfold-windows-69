
import React from 'react';
import { Appointment, Employee } from '@/types/appointment';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeeTimeFieldsProps {
  formData: Appointment;
  setFormData: (data: Appointment) => void;
  employees: Employee[];
  timeSlots: string[];
}

const EmployeeTimeFields: React.FC<EmployeeTimeFieldsProps> = ({
  formData,
  setFormData,
  employees,
  timeSlots
}) => {
  // Filter out employees without valid IDs
  const validEmployees = employees.filter(emp => emp.id && emp.name && emp.name.trim() !== '');
  
  // Filter out empty time slots
  const validTimeSlots = timeSlots.filter(slot => slot && slot.trim() !== '');

  return (
    <>
      <div>
        <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700 mb-1 block">
          Dipendente
        </Label>
        <Select 
          value={formData.employeeId?.toString() || ''} 
          onValueChange={(value) => setFormData({ ...formData, employeeId: parseInt(value) })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleziona dipendente" />
          </SelectTrigger>
          <SelectContent>
            {validEmployees.length > 0 ? (
              validEmployees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  {employee.name} - {employee.specialization}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-employees" disabled>
                Nessun dipendente disponibile
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="time" className="text-sm font-medium text-gray-700 mb-1 block">
          Orario
        </Label>
        <Select 
          value={formData.time || ''} 
          onValueChange={(value) => setFormData({ ...formData, time: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleziona orario" />
          </SelectTrigger>
          <SelectContent>
            {validTimeSlots.length > 0 ? (
              validTimeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-slots" disabled>
                Nessun orario disponibile
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default EmployeeTimeFields;
