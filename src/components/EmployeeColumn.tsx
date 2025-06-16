
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Appointment, Employee } from '@/types/appointment';
import TimeSlot from './TimeSlot';

interface EmployeeColumnProps {
  employee: Employee;
  appointments: Appointment[];
  timeSlots: string[];
  dateKey: string;
  onAddAppointment: (employeeId: number, time: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
}

const EmployeeColumn: React.FC<EmployeeColumnProps> = ({
  employee,
  appointments,
  timeSlots,
  dateKey,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment
}) => {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-center font-medium text-gray-700">
          {employee.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {timeSlots.map(time => {
          const appointment = appointments.find(apt => 
            apt.employeeId === employee.id && 
            apt.date === dateKey && 
            apt.time === time
          );

          return (
            <TimeSlot
              key={time}
              time={time}
              appointment={appointment}
              employee={employee}
              onAddAppointment={onAddAppointment}
              onEditAppointment={onEditAppointment}
              onDeleteAppointment={onDeleteAppointment}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};

export default EmployeeColumn;
