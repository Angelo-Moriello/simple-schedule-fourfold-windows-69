
import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Employee, Appointment } from '@/types/appointment';
import { getOccupiedSlots, isSlotOccupied } from '@/utils/timeSlotUtils';
import TimeSlot from './TimeSlot';
import EmployeeNameEditor from './EmployeeNameEditor';

interface EmployeeTimeSlotGridProps {
  employees: Employee[];
  appointments: Appointment[];
  selectedDate: Date;
  onAddAppointment: (employeeId: number, time: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onUpdateEmployeeName: (employeeId: number, newName: string) => void;
}

const EmployeeTimeSlotGrid: React.FC<EmployeeTimeSlotGridProps> = ({
  employees,
  appointments,
  selectedDate,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onUpdateEmployeeName
}) => {
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 19; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`);
      slots.push(`${String(i).padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const isVacationDay = useCallback((employeeId: number, date: Date): boolean => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee || !employee.vacations) {
      return false;
    }
    const dateString = format(date, 'yyyy-MM-dd');
    return employee.vacations.includes(dateString);
  }, [employees]);

  const getEmployeeAppointmentsForTimeSlot = (employeeId: number, time: string) => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return appointments.find(
      appointment => appointment.employeeId === employeeId && appointment.date === dateString && appointment.time === time
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {employees.map(employee => (
        <Card key={employee.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 mb-4">
              <EmployeeNameEditor
                employee={employee}
                onUpdateName={onUpdateEmployeeName}
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {timeSlots.map(time => {
                const appointment = getEmployeeAppointmentsForTimeSlot(employee.id, time);
                const occupiedSlots = getOccupiedSlots(appointments, employee.id, format(selectedDate, 'yyyy-MM-dd'));
                const isOccupied = isSlotOccupied(time, occupiedSlots);
                const vacation = isVacationDay(employee.id, selectedDate);

                return (
                  <TimeSlot
                    key={`${employee.id}-${time}`}
                    time={time}
                    appointment={appointment}
                    employee={employee}
                    onAddAppointment={onAddAppointment}
                    onEditAppointment={onEditAppointment}
                    onDeleteAppointment={onDeleteAppointment}
                    isVacationDay={vacation}
                    isOccupied={isOccupied}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmployeeTimeSlotGrid;
