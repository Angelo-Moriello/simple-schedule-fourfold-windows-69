
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone, Briefcase } from 'lucide-react';
import { Appointment, Employee } from '@/types/appointment';

interface AppointmentCardProps {
  appointment: Appointment;
  employee: Employee;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  isVacationDay?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  employee,
  onEdit,
  onDelete,
  isVacationDay = false
}) => {
  return (
    <div className={`${isVacationDay ? 'bg-red-100 border-red-300' : appointment.color} rounded-lg p-3 border-2 border-dashed relative group shadow-sm ${isVacationDay ? 'opacity-75' : ''}`}>
      <div className="font-semibold text-sm text-gray-800">
        {appointment.title}
      </div>
      <div className="text-xs mt-1 text-gray-700 font-medium">
        {appointment.client}
      </div>
      <div className="text-xs mt-1 flex items-center gap-1 text-purple-600 font-medium">
        <Briefcase className="h-3 w-3" />
        {appointment.serviceType || 'Non specificato'}
      </div>
      {appointment.email && (
        <div className="text-xs mt-1 flex items-center gap-1 text-gray-600">
          <Mail className="h-3 w-3" />
          {appointment.email}
        </div>
      )}
      {appointment.phone && (
        <div className="text-xs mt-1 flex items-center gap-1 text-gray-600">
          <Phone className="h-3 w-3" />
          {appointment.phone}
        </div>
      )}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
          onClick={() => onEdit(appointment)}
          disabled={isVacationDay}
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 bg-white/80 hover:bg-white"
          onClick={() => onDelete(appointment.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default AppointmentCard;
