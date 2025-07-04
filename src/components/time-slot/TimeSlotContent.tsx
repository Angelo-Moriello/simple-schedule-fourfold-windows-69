
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Edit, Trash2 } from 'lucide-react';
import { Appointment, Employee } from '@/types/appointment';
import RecurringTreatmentHandler from './RecurringTreatmentHandler';

interface TimeSlotContentProps {
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
  onRecurringEdit?: () => void;
}

const TimeSlotContent: React.FC<TimeSlotContentProps> = ({
  time,
  appointment,
  employee,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
  isVacationDay,
  isOccupied,
  occupiedBy,
  isPartiallyOccupied,
  onRecurringEdit
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

  // Helper function to get colors from hex value
  const getColorsFromHex = (colorValue: string) => {
    // If it's already a hex color, use it directly
    if (colorValue.startsWith('#')) {
      return {
        backgroundColor: `${colorValue}20`, // Add transparency
        borderColor: colorValue
      };
    }
    
    // Fallback for old CSS classes - convert to colors
    const colorMap: { [key: string]: { backgroundColor: string; borderColor: string } } = {
      'bg-blue-100 border-blue-300 text-blue-800': { backgroundColor: '#dbeafe', borderColor: '#93c5fd' },
      'bg-green-100 border-green-300 text-green-800': { backgroundColor: '#dcfce7', borderColor: '#86efac' },
      'bg-yellow-100 border-yellow-300 text-yellow-800': { backgroundColor: '#fef3c7', borderColor: '#fde047' },
      'bg-red-100 border-red-300 text-red-800': { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
      'bg-purple-100 border-purple-300 text-purple-800': { backgroundColor: '#f3e8ff', borderColor: '#c4b5fd' },
      'bg-pink-100 border-pink-300 text-pink-800': { backgroundColor: '#fce7f3', borderColor: '#f9a8d4' },
      'bg-orange-100 border-orange-300 text-orange-800': { backgroundColor: '#fed7aa', borderColor: '#fdba74' },
      'bg-gray-100 border-gray-300 text-gray-800': { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' }
    };
    
    return colorMap[colorValue] || { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' };
  };

  // Check if this is a vacation slot from the occupation info
  const isVacationSlot = (occupiedBy as any)?.isVacation || isVacationDay;
  const vacationType = (occupiedBy as any)?.vacationType || 'Ferie';

  // Slot in ferie
  if (isVacationSlot) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-center text-red-600">
          <span className="text-lg mr-2">🏖️</span>
          <span className="text-sm font-medium">{time}</span>
        </div>
        <div className="text-center mt-1">
          <Badge variant="destructive" className="text-xs">
            {typeof vacationType === 'string' ? vacationType : 'Ferie'}
          </Badge>
        </div>
      </div>
    );
  }

  // Slot occupato parzialmente
  if (isPartiallyOccupied && occupiedBy) {
    const colors = getColorsFromHex(occupiedBy.color);
    
    return (
      <div 
        className="p-3 border-2 rounded-lg relative overflow-hidden"
        style={{ 
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor
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
              <RecurringTreatmentHandler 
                occupiedBy={occupiedBy}
                onRecurringEdit={onRecurringEdit}
              />
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

    const colors = getColorsFromHex(appointment.color);

    return (
      <div 
        className="p-3 rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
        style={{ 
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor
        }}
        onClick={handleEditClick}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">{time}</span>
          <div className="flex items-center space-x-1">
            <Badge 
              className="text-xs text-white font-medium"
              style={{ backgroundColor: colors.borderColor }}
            >
              {durationText}
            </Badge>
          </div>
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
          <RecurringTreatmentHandler 
            appointment={appointment}
            onRecurringEdit={onRecurringEdit}
          />
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

export default TimeSlotContent;
