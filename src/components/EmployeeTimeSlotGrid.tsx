
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

  // Funzione per verificare se uno slot è occupato da un appuntamento di durata maggiore
  const getSlotOccupationInfo = useCallback((employeeId: number, time: string) => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    
    // Converti l'orario corrente in minuti
    const [currentHour, currentMinute] = time.split(':').map(Number);
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Trova tutti gli appuntamenti del dipendente per questa data
    const employeeAppointments = appointments.filter(apt => 
      apt.employeeId === employeeId && apt.date === dateString
    );

    for (const appointment of employeeAppointments) {
      // Converti l'orario dell'appuntamento in minuti
      const appointmentTime = String(appointment.time).substring(0, 5); // Prende solo HH:MM
      const [appointmentHour, appointmentMinute] = appointmentTime.split(':').map(Number);
      const appointmentStartInMinutes = appointmentHour * 60 + appointmentMinute;
      const appointmentEndInMinutes = appointmentStartInMinutes + appointment.duration;

      // Verifica se il current slot è nel range dell'appuntamento
      if (currentTimeInMinutes >= appointmentStartInMinutes && 
          currentTimeInMinutes < appointmentEndInMinutes) {
        return {
          isOccupied: true,
          occupiedBy: appointment,
          isPartiallyOccupied: currentTimeInMinutes !== appointmentStartInMinutes,
          isDirectMatch: currentTimeInMinutes === appointmentStartInMinutes
        };
      }
    }

    return { 
      isOccupied: false, 
      isPartiallyOccupied: false, 
      isDirectMatch: false 
    };
  }, [appointments, selectedDate]);

  const getEmployeeAppointmentsForTimeSlot = useCallback((employeeId: number, time: string) => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    
    // Trova l'appuntamento che inizia esattamente a questo orario
    const exactAppointment = appointments.find(apt => {
      const dateMatch = apt.date === dateString;
      const employeeMatch = apt.employeeId === employeeId;
      const aptTime = String(apt.time).substring(0, 5); // Prende solo HH:MM
      const timeMatch = aptTime === time;
      
      return dateMatch && employeeMatch && timeMatch;
    });
    
    return exactAppointment;
  }, [appointments, selectedDate]);

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
                const directAppointment = getEmployeeAppointmentsForTimeSlot(employee.id, time);
                const occupationInfo = getSlotOccupationInfo(employee.id, time);
                const vacation = isVacationDay(employee.id, selectedDate);

                return (
                  <TimeSlot
                    key={`${employee.id}-${time}`}
                    time={time}
                    appointment={occupationInfo.isDirectMatch ? occupationInfo.occupiedBy : directAppointment}
                    employee={employee}
                    onAddAppointment={onAddAppointment}
                    onEditAppointment={onEditAppointment}
                    onDeleteAppointment={onDeleteAppointment}
                    isVacationDay={vacation}
                    isOccupied={occupationInfo.isOccupied}
                    occupiedBy={occupationInfo.occupiedBy}
                    isPartiallyOccupied={occupationInfo.isPartiallyOccupied}
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
