
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
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
  // Unified button styles for ALL buttons
  const buttonStyles = "h-12 px-3 sm:px-4 lg:px-6 text-xs sm:text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 w-full";

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Button 
          onClick={onOpenEmployeeForm}
          className={`${buttonStyles} bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-1 sm:gap-2 lg:gap-3`}
        >
          <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
          <span className="hidden sm:inline lg:hidden xl:inline">Gestisci</span>
          <span className="sm:hidden lg:inline xl:hidden">Staff</span>
          <span className="hidden lg:hidden xl:inline">Staff</span>
        </Button>

        <div className={`h-12`}>
          <VacationManager 
            employees={employees}
            onUpdateEmployeeVacations={onUpdateEmployeeVacations}
          />
        </div>

        <div className={`h-12`}>
          <ServiceCategoryManager />
        </div>

        <Button 
          onClick={onOpenClientManager}
          className={`${buttonStyles} bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white gap-1 sm:gap-2 lg:gap-3`}
        >
          <span className="text-sm sm:text-base">👥</span>
          <span className="hidden sm:inline lg:hidden xl:inline">Gestisci</span>
          <span className="sm:hidden lg:inline xl:hidden">Clienti</span>
          <span className="hidden lg:hidden xl:inline">Clienti</span>
        </Button>

        <Button 
          onClick={onNavigateToHistory}
          className={`${buttonStyles} bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-1 sm:gap-2 lg:gap-3`}
        >
          <span className="text-sm sm:text-base">📚</span>
          <span className="hidden sm:inline lg:hidden xl:inline">Visualizza</span>
          <span className="sm:hidden lg:inline xl:hidden">Storico</span>
          <span className="hidden lg:hidden xl:inline">Storico</span>
        </Button>

        <Button 
          onClick={onNavigateToStatistics}
          className={`${buttonStyles} bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white gap-1 sm:gap-2 lg:gap-3`}
        >
          <span className="text-sm sm:text-base">📊</span>
          <span className="hidden sm:inline lg:hidden xl:inline">Visualizza</span>
          <span className="sm:hidden lg:inline xl:hidden">Stats</span>
          <span className="hidden lg:hidden xl:inline">Stats</span>
        </Button>
      </div>
    </div>
  );
};

export default AppointmentSchedulerControls;
