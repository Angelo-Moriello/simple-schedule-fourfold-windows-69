
import React, { useCallback, useState } from 'react';
import { format } from 'date-fns';
import { Employee, Appointment } from '@/types/appointment';
import { useIsMobile } from '@/hooks/use-mobile';
import EmployeeMobileCard from './employee-grid/EmployeeMobileCard';
import EmployeeDesktopCard from './employee-grid/EmployeeDesktopCard';

interface VacationEntry {
  date: string;
  type: 'full' | 'morning' | 'afternoon' | 'hours';
  startTime?: string;
  endTime?: string;
}

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

  const parseVacationEntries = (vacations: string[]): VacationEntry[] => {
    return vacations.map(vacation => {
      try {
        // Try to parse as JSON for new format
        return JSON.parse(vacation) as VacationEntry;
      } catch {
        // Fallback to old format (just date strings)
        return {
          date: vacation,
          type: 'full'
        };
      }
    });
  };

  const isVacationDay = useCallback((employeeId: number, date: Date): boolean => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee || !employee.vacations) {
      return false;
    }
    
    const dateString = format(date, 'yyyy-MM-dd');
    const vacationEntries = parseVacationEntries(employee.vacations);
    
    return vacationEntries.some(entry => entry.date === dateString);
  }, [employees]);

  const getVacationInfo = useCallback((employeeId: number, date: Date, time: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee || !employee.vacations) {
      return null;
    }
    
    const dateString = format(date, 'yyyy-MM-dd');
    const vacationEntries = parseVacationEntries(employee.vacations);
    const vacationEntry = vacationEntries.find(entry => entry.date === dateString);
    
    if (!vacationEntry) return null;

    // Convert time to minutes for comparison
    const [hour, minute] = time.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;

    switch (vacationEntry.type) {
      case 'full':
        return { isVacation: true, type: 'Ferie - Giorno intero' };
      
      case 'morning':
        // Morning vacation typically until 12:00
        if (timeInMinutes < 12 * 60) {
          return { isVacation: true, type: 'Ferie - Mattina' };
        }
        break;
      
      case 'afternoon':
        // Afternoon vacation typically from 12:00
        if (timeInMinutes >= 12 * 60) {
          return { isVacation: true, type: 'Ferie - Pomeriggio' };
        }
        break;
      
      case 'hours':
        if (vacationEntry.startTime && vacationEntry.endTime) {
          const [startHour, startMinute] = vacationEntry.startTime.split(':').map(Number);
          const [endHour, endMinute] = vacationEntry.endTime.split(':').map(Number);
          const startInMinutes = startHour * 60 + startMinute;
          const endInMinutes = endHour * 60 + endMinute;
          
          if (timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes) {
            return { 
              isVacation: true, 
              type: `Ferie - ${vacationEntry.startTime} - ${vacationEntry.endTime}` 
            };
          }
        }
        break;
    }

    return null;
  }, [employees]);

  const getSlotOccupationInfo = useCallback((employeeId: number, time: string) => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    
    // First check for vacation
    const vacationInfo = getVacationInfo(employeeId, selectedDate, time);
    if (vacationInfo) {
      return {
        isOccupied: true,
        isVacation: true,
        vacationType: vacationInfo.type,
        occupiedBy: null,
        isPartiallyOccupied: false,
        isDirectMatch: false
      };
    }
    
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
          isVacation: false,
          occupiedBy: appointment,
          isPartiallyOccupied: currentTimeInMinutes !== appointmentStartInMinutes,
          isDirectMatch: currentTimeInMinutes === appointmentStartInMinutes
        };
      }
    }

    return { 
      isOccupied: false,
      isVacation: false,
      isPartiallyOccupied: false, 
      isDirectMatch: false 
    };
  }, [appointments, selectedDate, getVacationInfo]);

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
            <EmployeeMobileCard
              key={employee.id}
              employee={employee}
              appointmentCount={appointmentCount}
              isOpen={isOpen}
              onToggle={() => toggleEmployee(employee.id)}
              timeSlots={timeSlots}
              appointments={appointments}
              selectedDate={selectedDate}
              onAddAppointment={onAddAppointment}
              onEditAppointment={onEditAppointment}
              onDeleteAppointment={onDeleteAppointment}
              onUpdateEmployeeName={onUpdateEmployeeName}
              getEmployeeAppointmentsForTimeSlot={getEmployeeAppointmentsForTimeSlot}
              getSlotOccupationInfo={getSlotOccupationInfo}
              isVacationDay={isVacationDay}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {employees.map(employee => (
        <EmployeeDesktopCard
          key={employee.id}
          employee={employee}
          timeSlots={timeSlots}
          appointments={appointments}
          selectedDate={selectedDate}
          onAddAppointment={onAddAppointment}
          onEditAppointment={onEditAppointment}
          onDeleteAppointment={onDeleteAppointment}
          onUpdateEmployeeName={onUpdateEmployeeName}
          getEmployeeAppointmentsForTimeSlot={getEmployeeAppointmentsForTimeSlot}
          getSlotOccupationInfo={getSlotOccupationInfo}
          isVacationDay={isVacationDay}
        />
      ))}
    </div>
  );
};

export default EmployeeTimeSlotGrid;
