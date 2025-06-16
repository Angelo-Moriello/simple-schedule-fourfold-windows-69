
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone } from 'lucide-react';
import { Appointment, Employee } from '@/types/appointment';

interface AppointmentCardProps {
  appointment: Appointment;
  employee: Employee;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  employee,
  onEdit,
  onDelete
}) => {
  return (
    <div className={`${appointment.color} rounded-lg p-3 border-2 border-dashed relative group`}>
      <div className="font-medium text-sm">
        {appointment.title}
      </div>
      <div className="text-xs mt-1">
        {appointment.client}
      </div>
      {appointment.email && (
        <div className="text-xs mt-1 flex items-center gap-1">
          <Mail className="h-3 w-3" />
          {appointment.email}
        </div>
      )}
      {appointment.phone && (
        <div className="text-xs mt-1 flex items-center gap-1">
          <Phone className="h-3 w-3" />
          {appointment.phone}
        </div>
      )}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onEdit(appointment)}
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
          onClick={() => onDelete(appointment.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default AppointmentCard;
