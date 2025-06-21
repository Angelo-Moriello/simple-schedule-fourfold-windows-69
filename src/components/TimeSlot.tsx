
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
  occupiedBy?: Appointment; // Appuntamento che occupa questo slot
  isPartiallyOccupied?: boolean; // Se è occupato parzialmente da un appuntamento più lungo
}

// Funzione helper per calcolare se uno slot è occupato da un appuntamento di durata maggiore
const isSlotOccupiedByLongerAppointment = (
  currentTime: string,
  appointments: Appointment[],
  employeeId: number
): { isOccupied: boolean; occupiedBy?: Appointment; isPartiallyOccupied?: boolean } => {
  // Converti l'orario corrente in minuti
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  for (const appointment of appointments) {
    if (appointment.employeeId !== employeeId) continue;

    // Converti l'orario dell'appuntamento in minuti
    const [appointmentHour, appointmentMinute] = appointment.time.split(':').map(Number);
    const appointmentStartInMinutes = appointmentHour * 60 + appointmentMinute;
    const appointmentEndInMinutes = appointmentStartInMinutes + appointment.duration;

    // Verifica se il current slot è nel range dell'appuntamento
    if (currentTimeInMinutes >= appointmentStartInMinutes && 
        currentTimeInMinutes < appointmentEndInMinutes) {
      return {
        isOccupied: true,
        occupiedBy: appointment,
        isPartiallyOccupied: currentTimeInMinutes !== appointmentStartInMinutes
      };
    }
  }

  return { isOccupied: false };
};

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
    if (appointment) {
      onEditAppointment(appointment);
    } else if (occupiedBy) {
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
    return (
      <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-lg relative overflow-hidden">
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
            <p className="text-xs text-gray-600 mb-2 flex items-center justify-center">
              <User className="h-3 w-3 mr-1" />
              {occupiedBy.client}
            </p>
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

    return (
      <div 
        className="p-3 rounded-lg border-2 border-opacity-60 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
        style={{ 
          backgroundColor: appointment.color + '20',
          borderColor: appointment.color,
          background: `linear-gradient(135deg, ${appointment.color}15 0%, ${appointment.color}25 100%)`
        }}
        onClick={handleEditClick}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">{time}</span>
          <Badge 
            className="text-xs text-white font-medium"
            style={{ backgroundColor: appointment.color }}
          >
            {durationText}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <p className="font-semibold text-sm text-gray-900 leading-tight">
            {appointment.title}
          </p>
          <p className="text-sm text-gray-700 flex items-center">
            <User className="h-3 w-3 mr-1" />
            {appointment.client}
          </p>
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
