
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Employee, Appointment } from '@/types/appointment';
import DraggableEmployeeCard from './DraggableEmployeeCard';
import { useEmployeeOrder } from '@/hooks/useEmployeeOrder';

interface DraggableEmployeeGridProps {
  employees: Employee[];
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

const DraggableEmployeeGrid: React.FC<DraggableEmployeeGridProps> = ({
  employees,
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
  const { orderedEmployees, updateOrder } = useEmployeeOrder(employees);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedEmployees.findIndex((emp) => emp.id.toString() === active.id);
      const newIndex = orderedEmployees.findIndex((emp) => emp.id.toString() === over.id);

      const newOrderedEmployees = arrayMove(orderedEmployees, oldIndex, newIndex);
      updateOrder(newOrderedEmployees);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={orderedEmployees.map(emp => emp.id.toString())} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orderedEmployees.map(employee => (
            <DraggableEmployeeCard
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
      </SortableContext>
    </DndContext>
  );
};

export default DraggableEmployeeGrid;
