
import React from 'react';
import { Appointment, Employee } from '@/types/appointment';
import TimeSlotContent from './time-slot/TimeSlotContent';

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
  onRecurringEdit?: () => void;
}

const TimeSlot: React.FC<TimeSlotProps> = (props) => {
  return <TimeSlotContent {...props} />;
};

export default TimeSlot;
