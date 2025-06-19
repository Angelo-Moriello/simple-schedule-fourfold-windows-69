
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Appointment, Employee } from '@/types/appointment';
import TimeSlot from './TimeSlot';
import EmployeeNameEditor from './EmployeeNameEditor';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getOccupiedSlots, isSlotOccupied } from '@/utils/timeSlotUtils';

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
  // Count appointments for this employee on this day
  const employeeAppointments = appointments.filter(apt => 
    apt.employeeId === employee.id && 
    apt.date === dateKey
  );
  
  // Check if current date is a vacation day for this employee
  const isVacationDay = employee.vacations?.includes(dateKey) || false;
  
  // Get occupied slots for this employee on this date
  const occupiedSlots = getOccupiedSlots(appointments, employee.id, dateKey);
  
  // Mobile accordion view
  const mobileView = (
    <Accordion type="single" collapsible className="w-full lg:hidden">
      <AccordionItem 
        value={`employee-${employee.id}`} 
        className={`border rounded-lg shadow-sm ${isVacationDay ? 'bg-red-50 border-red-200' : 'bg-white'}`}
      >
        <AccordionTrigger className="px-4 py-2 hover:no-underline">
          <div className="flex justify-between items-center w-full">
            <div className="flex-1 text-left">
              <EmployeeNameEditor
                employee={employee}
                onUpdateName={onUpdateEmployeeName}
              />
              {isVacationDay && (
                <div className="text-xs text-red-600 font-medium mt-1">In Ferie</div>
              )}
            </div>
            <span className={`text-sm px-2 py-1 rounded-full ml-2 ${isVacationDay ? 'bg-red-200 text-red-800' : 'bg-blue-100'}`}>
              {isVacationDay ? 'Ferie' : `${employeeAppointments.length} appuntamenti`}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-2 mt-2">
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
                  isVacationDay={isVacationDay}
                  isOccupied={isSlotOccupied(time, occupiedSlots)}
                />
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  // Desktop card view
  const desktopView = (
    <Card className={`h-fit hidden lg:block ${isVacationDay ? 'bg-red-50 border-red-200' : ''}`}>
      <CardHeader className={`pb-3 ${isVacationDay ? 'bg-red-100' : ''}`}>
        <EmployeeNameEditor
          employee={employee}
          onUpdateName={onUpdateEmployeeName}
        />
        {isVacationDay && (
          <div className="text-xs text-red-600 font-medium">In Ferie</div>
        )}
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
              isVacationDay={isVacationDay}
              isOccupied={isSlotOccupied(time, occupiedSlots)}
            />
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
};

export default EmployeeColumn;
