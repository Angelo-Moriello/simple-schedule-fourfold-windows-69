
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
      <div className="flex items-center text-xs text-gray-400 mb-1">
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
          className="w-full h-12 border-2 border-dashed border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600"
          onClick={() => onAddAppointment(employee.id, time)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default TimeSlot;
