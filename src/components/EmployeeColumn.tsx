
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Appointment, Employee } from '@/types/appointment';
import TimeSlot from './TimeSlot';
import EmployeeNameEditor from './EmployeeNameEditor';

interface EmployeeColumnProps {
  employee: Employee;
  appointments: Appointment[];
  timeSlots: string[];
  dateKey: string;
  onAddAppointment: (employeeId: number, time: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onUpdateEmployeeName: (employeeId: number, newName: string) => void;
}

const EmployeeColumn: React.FC<EmployeeColumnProps> = ({
  employee,
  appointments,
  timeSlots,
  dateKey,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onUpdateEmployeeName
}) => {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <EmployeeNameEditor
          employee={employee}
          onUpdateName={onUpdateEmployeeName}
        />
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
