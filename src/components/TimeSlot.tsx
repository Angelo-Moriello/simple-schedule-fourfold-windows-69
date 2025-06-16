
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
}

const TimeSlot: React.FC<TimeSlotProps> = ({
  time,
  appointment,
  employee,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment
}) => {
  return (
    <div className="relative">
      <div className="flex items-center text-xs font-medium text-gray-600 mb-2 bg-gray-100 px-2 py-1 rounded">
        {time}
      </div>
      {appointment ? (
        <AppointmentCard
          appointment={appointment}
          employee={employee}
          onEdit={onEditAppointment}
          onDelete={onDeleteAppointment}
        />
      ) : (
        <Button
          variant="ghost"
          className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-all duration-200"
          onClick={() => onAddAppointment(employee.id, time)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default TimeSlot;
