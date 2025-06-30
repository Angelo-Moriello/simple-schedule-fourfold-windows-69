
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Employee, Appointment } from '@/types/appointment';
import EmployeeNameEditor from '../EmployeeNameEditor';
import TimeSlot from '../TimeSlot';
import { GripVertical } from 'lucide-react';

interface DraggableEmployeeCardProps {
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

const DraggableEmployeeCard: React.FC<DraggableEmployeeCardProps> = ({
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: employee.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
        isDragging ? 'shadow-2xl ring-2 ring-blue-400' : 'hover:shadow-lg'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <EmployeeNameEditor
              employee={employee}
              onUpdateName={onUpdateEmployeeName}
            />
            <div 
              {...attributes} 
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Trascina per riordinare"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          </div>
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

export default DraggableEmployeeCard;
