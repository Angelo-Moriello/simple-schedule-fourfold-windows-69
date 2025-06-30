import React, { useCallback, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Employee, Appointment } from '@/types/appointment';
import { useIsMobile } from '@/hooks/use-mobile';
import EmployeeMobileCard from './employee-grid/EmployeeMobileCard';
import DraggableEmployeeGrid from './employee-grid/DraggableEmployeeGrid';

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

  // Removed vacation functionality - always return false
  const isVacationDay = useCallback((employeeId: number, date: Date): boolean => {
    return false;
  }, []);

  // Removed vacation functionality - always return null
  const getVacationInfo = useCallback((employeeId: number, date: Date, time: string) => {
    return null;
  }, []);

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
    <DraggableEmployeeGrid
      employees={employees}
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
};

export default EmployeeTimeSlotGrid;
