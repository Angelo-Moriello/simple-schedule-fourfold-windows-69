
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Appointment, Employee } from '@/types/appointment';
import AppointmentCard from './AppointmentCard';

interface TimeSlotProps {
  time: string;
  appointment: Appointment | undefined;
  employee: Employee;
  onAddAppointment: (employeeId: number, time: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  isVacationDay?: boolean;
  isOccupied?: boolean;
}

const TimeSlot: React.FC<TimeSlotProps> = ({
  time,
  appointment,
  employee,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
  isVacationDay = false,
  isOccupied = false
}) => {
  const isDisabled = isVacationDay || (isOccupied && !appointment);
  
  return (
    <div className="relative">
      <div className={`flex items-center text-xs font-medium mb-2 px-2 py-1 rounded ${
        isVacationDay ? 'text-red-600 bg-red-200' : 'text-gray-600 bg-gray-100'
      }`}>
        {time}
      </div>
      {appointment ? (
        <AppointmentCard
          appointment={appointment}
          employee={employee}
          onEdit={onEditAppointment}
          onDelete={onDeleteAppointment}
          isVacationDay={isVacationDay}
        />
      ) : (
        <Button
          variant="ghost"
          className={`w-full h-12 border-2 border-dashed transition-all duration-200 ${
            isDisabled
              ? 'border-red-300 bg-red-50 text-red-400 cursor-not-allowed opacity-60' 
              : isOccupied
              ? 'border-orange-300 bg-orange-50 text-orange-400 cursor-not-allowed opacity-60'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => !isDisabled && onAddAppointment(employee.id, time)}
          disabled={isDisabled}
        >
          {isVacationDay ? 'Ferie' : isOccupied ? 'Occupato' : <Plus className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
};

export default TimeSlot;
