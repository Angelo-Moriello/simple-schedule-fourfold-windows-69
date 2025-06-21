import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { Employee, Appointment } from '@/types/appointment';
import TimeSlot from './TimeSlot';
import EmployeeNameEditor from './EmployeeNameEditor';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [openEmployees, setOpenEmployees] = useState<Record<number, boolean>>({});

  const toggleEmployee = (employeeId: number) => {
    setOpenEmployees(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

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

  const getSlotOccupationInfo = useCallback((employeeId: number, time: string) => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    
    const [currentHour, currentMinute] = time.split(':').map(Number);
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const employeeAppointments = appointments.filter(apt => 
      apt.employeeId === employeeId && apt.date === dateString
    );

    for (const appointment of employeeAppointments) {
      const appointmentTime = String(appointment.time).substring(0, 5);
      const [appointmentHour, appointmentMinute] = appointmentTime.split(':').map(Number);
      const appointmentStartInMinutes = appointmentHour * 60 + appointmentMinute;
      const appointmentEndInMinutes = appointmentStartInMinutes + appointment.duration;

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
    
    const exactAppointment = appointments.find(apt => {
      const dateMatch = apt.date === dateString;
      const employeeMatch = apt.employeeId === employeeId;
      const aptTime = String(apt.time).substring(0, 5);
      const timeMatch = aptTime === time;
      
      return dateMatch && employeeMatch && timeMatch;
    });
    
    return exactAppointment;
  }, [appointments, selectedDate]);

  // Calcola il numero di appuntamenti per dipendente
  const getEmployeeAppointmentCount = (employeeId: number) => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return appointments.filter(apt => 
      apt.employeeId === employeeId && apt.date === dateString
    ).length;
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {employees.map(employee => {
          const appointmentCount = getEmployeeAppointmentCount(employee.id);
          const isOpen = openEmployees[employee.id] || false;
          
          return (
            <Collapsible
              key={employee.id}
              open={isOpen}
              onOpenChange={() => toggleEmployee(employee.id)}
            >
              <Card className="bg-white rounded-lg shadow-md overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full border-2"
                          style={{ 
                            backgroundColor: employee.color + '40',
                            borderColor: employee.color 
                          }}
                        />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                          <p className="text-sm text-gray-600">{employee.specialization}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {appointmentCount} appuntament{appointmentCount !== 1 ? 'i' : 'o'}
                          </p>
                          <p className="text-xs text-gray-500">oggi</p>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="border-t border-gray-200 pt-4">
                      <div className="mb-4">
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
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    );
  }

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
