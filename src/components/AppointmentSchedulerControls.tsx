
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, UserPlus, Plane, History, BarChart3, Users } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Employee } from '@/types/appointment';
import { useIsMobile } from '@/hooks/use-mobile';
import DateNavigator from './DateNavigator';
import FullCalendar from './FullCalendar';
import VacationManager from './VacationManager';
import LocalBackupManager from './LocalBackupManager';

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
  onOpenClientManager?: () => void;
  appointments?: any[];
}

const AppointmentSchedulerControls: React.FC<AppointmentSchedulerControlsProps> = ({
  selectedDate,
  employees,
  showFullCalendar,
  onDateSelect,
  onShowFullCalendar,
  onOpenEmployeeForm,
  onUpdateEmployeeVacations,
  onNavigateToHistory,
  onNavigateToStatistics,
  onOpenClientManager,
  appointments = []
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
      <div className="p-4 sm:p-6">
        {/* Date Navigator - Centered at top */}
        <div className="flex justify-center mb-6">
          <DateNavigator 
            selectedDate={selectedDate} 
            onDateSelect={onDateSelect}
          />
        </div>

        {/* Action Buttons - All in one horizontal line */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button 
            onClick={() => onShowFullCalendar(true)} 
            variant="outline" 
            className="h-11 px-4 rounded-full border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <CalendarDays className="h-5 w-5 mr-2" />
            <span className="font-medium">Calendario</span>
          </Button>

          <Button 
            onClick={onOpenEmployeeForm} 
            variant="outline" 
            className="h-11 px-4 rounded-full border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            <span className="font-medium">Dipendenti</span>
          </Button>

          {onOpenClientManager && (
            <Button 
              onClick={onOpenClientManager} 
              variant="outline" 
              className="h-11 px-4 rounded-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Users className="h-5 w-5 mr-2" />
              <span className="font-medium">Clienti</span>
            </Button>
          )}

          <VacationManager 
            employees={employees} 
            onUpdateEmployeeVacations={onUpdateEmployeeVacations} 
          />

          {!isMobile && <LocalBackupManager />}

          <Button 
            onClick={onNavigateToHistory} 
            variant="outline" 
            className="h-11 px-4 rounded-full border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <History className="h-5 w-5 mr-2" />
            <span className="font-medium">Storico</span>
          </Button>

          <Button 
            onClick={onNavigateToStatistics} 
            variant="outline" 
            className="h-11 px-4 rounded-full border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            <span className="font-medium">Statistiche</span>
          </Button>
        </div>
      </div>

      {showFullCalendar && (
        <FullCalendar 
          isOpen={showFullCalendar} 
          onClose={() => onShowFullCalendar(false)} 
          appointments={appointments} 
          employees={employees} 
          onDateSelect={(date) => {
            onDateSelect(date);
            onShowFullCalendar(false);
          }} 
        />
      )}
    </div>
  );
};

export default AppointmentSchedulerControls;
