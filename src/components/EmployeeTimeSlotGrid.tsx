
import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Employee, Appointment } from '@/types/appointment';
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

  const getEmployeeAppointmentsForTimeSlot = useCallback((employeeId: number, time: string) => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    
    console.log('Ricerca appuntamento per:', { 
      employeeId, 
      time, 
      dateString, 
      totalAppointments: appointments.length,
      appointmentsForDate: appointments.filter(apt => apt.date === dateString).length
    });
    
    const foundAppointment = appointments.find(
      appointment => {
        const matches = appointment.employeeId === employeeId && 
                      appointment.date === dateString && 
                      appointment.time === time;
        
        if (matches) {
          console.log('Appuntamento trovato:', appointment);
        }
        
        return matches;
      }
    );
    
    return foundAppointment;
  }, [appointments, selectedDate]);

  // Debug effect per monitorare i props
  React.useEffect(() => {
    console.log('EmployeeTimeSlotGrid props aggiornate:', {
      employeesCount: employees.length,
      appointmentsCount: appointments.length,
      selectedDate: format(selectedDate, 'yyyy-MM-dd'),
      appointments: appointments
    });
  }, [employees, appointments, selectedDate]);

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
                    isOccupied={false}
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
