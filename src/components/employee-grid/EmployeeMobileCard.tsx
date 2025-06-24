
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Employee, Appointment } from '@/types/appointment';
import EmployeeNameEditor from '../EmployeeNameEditor';
import TimeSlot from '../TimeSlot';

interface EmployeeMobileCardProps {
  employee: Employee;
  appointmentCount: number;
  isOpen: boolean;
  onToggle: () => void;
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

const EmployeeMobileCard: React.FC<EmployeeMobileCardProps> = ({
  employee,
  appointmentCount,
  isOpen,
  onToggle,
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
    <Collapsible open={isOpen} onOpenChange={onToggle}>
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
};

export default EmployeeMobileCard;
