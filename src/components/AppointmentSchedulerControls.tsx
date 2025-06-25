import React from 'react';
import { Button } from '@/components/ui/button';
import { Employee, Appointment } from '@/types/appointment';
import VacationManager from './VacationManager';
import ServiceCategoryManager from './ServiceCategoryManager';
interface AppointmentSchedulerControlsProps {
  selectedDate: Date;
  employees: Employee[];
  showFullCalendar: boolean;
  onDateSelect: (date: Date | undefined) => void;
  onShowFullCalendar: (show: boolean) => void;
  onOpenEmployeeForm: () => void;
  onUpdateEmployeeVacations: (employeeId: number, vacations: string[]) => void;
  onNavigateToHistory: () => void;
  onNavigateToStatistics: () => void;
  onOpenClientManager: () => void;
  appointments: Appointment[];
}
const AppointmentSchedulerControls: React.FC<AppointmentSchedulerControlsProps> = ({
  onOpenEmployeeForm,
  employees,
  onUpdateEmployeeVacations,
  onNavigateToHistory,
  onNavigateToStatistics,
  onOpenClientManager
}) => {
  return <div className="backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6 bg-stone-100">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Button onClick={onOpenEmployeeForm} variant="secondary" size="lg" className="w-full gap-2">
          <span className="text-base">👥</span>
          <span className="hidden sm:inline">Staff</span>
        </Button>

        <div className="h-12">
          <VacationManager employees={employees} onUpdateEmployeeVacations={onUpdateEmployeeVacations} />
        </div>

        <div className="h-12">
          <ServiceCategoryManager />
        </div>

        <Button onClick={onOpenClientManager} variant="secondary" size="lg" className="w-full gap-2">
          <span className="text-base">👤</span>
          <span className="hidden sm:inline">Clienti</span>
        </Button>

        <Button onClick={onNavigateToHistory} variant="secondary" size="lg" className="w-full gap-2">
          <span className="text-base">📋</span>
          <span className="hidden sm:inline">Storico</span>
        </Button>

        <Button onClick={onNavigateToStatistics} variant="secondary" size="lg" className="w-full gap-2">
          <span className="text-base">📊</span>
          <span className="hidden sm:inline">Stats</span>
        </Button>
      </div>
    </div>;
};
export default AppointmentSchedulerControls;