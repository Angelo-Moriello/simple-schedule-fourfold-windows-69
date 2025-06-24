import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Edit, Trash2 } from 'lucide-react';
import { Appointment, Employee } from '@/types/appointment';

interface TimeSlotProps {
  time: string;
  appointment?: Appointment;
  employee: Employee;
  onAddAppointment: (employeeId: number, time: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  isVacationDay: boolean;
  isOccupied: boolean;
  occupiedBy?: Appointment;
  isPartiallyOccupied?: boolean;
}

const TimeSlot: React.FC<TimeSlotProps> = ({
  time,
  appointment,
  employee,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
  isVacationDay,
  isOccupied,
  occupiedBy,
  isPartiallyOccupied
}) => {
  const handleAddClick = () => {
    if (!isVacationDay && !isOccupied && !appointment) {
      onAddAppointment(employee.id, time);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('DEBUG - TimeSlot edit click:', { appointment, occupiedBy });
    
    if (appointment) {
      console.log('DEBUG - Editing appointment:', appointment);
      onEditAppointment(appointment);
    } else if (occupiedBy) {
      console.log('DEBUG - Editing occupied appointment:', occupiedBy);
      onEditAppointment(occupiedBy);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (appointment) {
      onDeleteAppointment(appointment.id);
    } else if (occupiedBy) {
      onDeleteAppointment(occupiedBy.id);
    }
  };

  // Funzione per estrarre il colore di sfondo dal color class
  const getBackgroundColorFromClass = (colorClass: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-blue-100 border-blue-300 text-blue-800': '#dbeafe',
      'bg-green-100 border-green-300 text-green-800': '#dcfce7',
      'bg-yellow-100 border-yellow-300 text-yellow-800': '#fef3c7',
      'bg-red-100 border-red-300 text-red-800': '#fee2e2',
      'bg-purple-100 border-purple-300 text-purple-800': '#f3e8ff',
      'bg-pink-100 border-pink-300 text-pink-800': '#fce7f3',
      'bg-orange-100 border-orange-300 text-orange-800': '#fed7aa',
      'bg-gray-100 border-gray-300 text-gray-800': '#f3f4f6'
    };
    return colorMap[colorClass] || '#f3f4f6';
  };

  // Funzione per estrarre il colore del bordo dal color class
  const getBorderColorFromClass = (colorClass: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-blue-100 border-blue-300 text-blue-800': '#93c5fd',
      'bg-green-100 border-green-300 text-green-800': '#86efac',
      'bg-yellow-100 border-yellow-300 text-yellow-800': '#fde047',
      'bg-red-100 border-red-300 text-red-800': '#fca5a5',
      'bg-purple-100 border-purple-300 text-purple-800': '#c4b5fd',
      'bg-pink-100 border-pink-300 text-pink-800': '#f9a8d4',
      'bg-orange-100 border-orange-300 text-orange-800': '#fdba74',
      'bg-gray-100 border-gray-300 text-gray-800': '#d1d5db'
    };
    return colorMap[colorClass] || '#d1d5db';
  };

  // Slot in ferie
  if (isVacationDay) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-center text-red-600">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">{time}</span>
        </div>
        <div className="text-center mt-1">
          <Badge variant="destructive" className="text-xs">
            Ferie
          </Badge>
        </div>
      </div>
    );
  }

  // Slot occupato parzialmente da un appuntamento più lungo
  if (isPartiallyOccupied && occupiedBy) {
    const backgroundColor = getBackgroundColorFromClass(occupiedBy.color);
    const borderColor = getBorderColorFromClass(occupiedBy.color);
    
    return (
      <div 
        className="p-3 border-2 rounded-lg relative overflow-hidden"
        style={{ 
          backgroundColor: backgroundColor,
          borderColor: borderColor
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/30 to-transparent animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">{time}</span>
            <Badge variant="secondary" className="text-xs bg-gray-400 text-white">
              Occupato
            </Badge>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Continua: {occupiedBy.title}
            </p>
            <p className="text-xs text-gray-600 mb-1 flex items-center justify-center">
              <User className="h-3 w-3 mr-1" />
              {occupiedBy.client}
            </p>
            {occupiedBy.serviceType && (
              <p className="text-xs text-gray-500 mb-2 italic">
                {occupiedBy.serviceType}
              </p>
            )}
            <div className="flex justify-center space-x-1">
              <Button
                onClick={handleEditClick}
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs border-gray-400 hover:bg-gray-200"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                onClick={handleDeleteClick}
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs border-red-400 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slot con appuntamento
  if (appointment) {
    const durationHours = Math.floor(appointment.duration / 60);
    const durationMinutes = appointment.duration % 60;
    const durationText = durationHours > 0 
      ? `${durationHours}h ${durationMinutes}min`
      : `${durationMinutes}min`;

    const backgroundColor = getBackgroundColorFromClass(appointment.color);
    const borderColor = getBorderColorFromClass(appointment.color);

    console.log('DEBUG - Rendering appointment slot:', {
      id: appointment.id,
      client: appointment.client,
      email: appointment.email,
      phone: appointment.phone,
      serviceType: appointment.serviceType,
      clientId: appointment.clientId
    });

    return (
      <div 
        className="p-3 rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
        style={{ 
          backgroundColor: backgroundColor,
          borderColor: borderColor
        }}
        onClick={handleEditClick}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">{time}</span>
          <Badge 
            className="text-xs text-white font-medium"
            style={{ backgroundColor: borderColor }}
          >
            {durationText}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <p className="font-semibold text-sm text-gray-900 leading-tight">
            {appointment.title || appointment.serviceType}
          </p>
          <p className="text-sm text-gray-700 flex items-center">
            <User className="h-3 w-3 mr-1" />
            {appointment.client}
          </p>
          {appointment.serviceType && (
            <p className="text-xs text-gray-600 font-medium bg-white/50 px-2 py-1 rounded">
              {appointment.serviceType}
            </p>
          )}
          {appointment.notes && (
            <p className="text-xs text-gray-600 italic truncate">
              {appointment.notes}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-1 mt-3">
          <Button
            onClick={handleEditClick}
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs bg-white/50 hover:bg-white/80"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            onClick={handleDeleteClick}
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Slot vuoto
  return (
    <Button
      onClick={handleAddClick}
      variant="outline"
      className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-gray-500 hover:text-blue-600"
    >
      <div className="text-center">
        <Clock className="h-4 w-4 mx-auto mb-1" />
        <span className="text-sm font-medium">{time}</span>
      </div>
    </Button>
  );
};

export default TimeSlot;
