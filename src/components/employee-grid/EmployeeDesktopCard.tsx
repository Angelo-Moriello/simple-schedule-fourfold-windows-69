
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Employee, Appointment } from '@/types/appointment';
import EmployeeNameEditor from '../EmployeeNameEditor';
import TimeSlot from '../TimeSlot';

interface EmployeeDesktopCardProps {
  employee: Employee;
  timeSlots: string[];
  appointments: Appointment[];
  selectedDate: Date;
  onAddAppointment: (employeeId: number, time: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onUpdateEmployeeName: (employeeId: number, newName: string) => void;
  getEmployeeAppointmentsForTimeSlot: (employeeId: number, time: string) => Appointment | undefined;
  getSlotOccupationInfo: (employeeId: number, time: string) => any;
  isVacationDay: (employeeId: number, date: Date) => boolean;
}

const EmployeeDesktopCard: React.FC<EmployeeDesktopCardProps> = ({
  employee,
  timeSlots,
  appointments,
  selectedDate,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onUpdateEmployeeName,
  getEmployeeAppointmentsForTimeSlot,
  getSlotOccupationInfo,
  isVacationDay
}) => {
  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 mb-4">
          <EmployeeNameEditor
            employee={employee}
            onUpdateName={onUpdateEmployeeName}
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          {timeSlots.map(time => {
            const directAppointment = getEmployeeAppointmentsForTimeSlot(employee.id, time);
            const occupationInfo = getSlotOccupationInfo(employee.id, time);

            return (
              <TimeSlot
                key={`${employee.id}-${time}`}
                time={time}
                appointment={occupationInfo.isDirectMatch ? occupationInfo.occupiedBy : directAppointment}
                employee={employee}
                onAddAppointment={onAddAppointment}
                onEditAppointment={onEditAppointment}
                onDeleteAppointment={onDeleteAppointment}
                isVacationDay={occupationInfo.isVacation || false}
                isOccupied={occupationInfo.isOccupied}
                occupiedBy={occupationInfo.isVacation ? { 
                  isVacation: true, 
                  vacationType: occupationInfo.vacationType 
                } : occupationInfo.occupiedBy}
                isPartiallyOccupied={occupationInfo.isPartiallyOccupied}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeDesktopCard;
