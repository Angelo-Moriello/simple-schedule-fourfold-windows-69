
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, UserPlus, Plane, History, BarChart3, Users } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Employee } from '@/types/appointment';
import DateNavigator from './DateNavigator';
import FullCalendar from './FullCalendar';
import VacationManager from './VacationManager';

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
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button 
            onClick={() => onShowFullCalendar(true)} 
            variant="outline" 
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Calendario Completo
          </Button>

          <Button 
            onClick={onOpenEmployeeForm} 
            variant="outline" 
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Gestisci Dipendenti
          </Button>

          {onOpenClientManager && (
            <Button 
              onClick={onOpenClientManager} 
              variant="outline" 
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Gestisci Clienti
            </Button>
          )}

          <VacationManager 
            employees={employees} 
            onUpdateEmployeeVacations={onUpdateEmployeeVacations} 
          />

          <Button 
            onClick={onNavigateToHistory} 
            variant="outline" 
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            <History className="h-4 w-4 mr-2" />
            Storico
          </Button>

          <Button 
            onClick={onNavigateToStatistics} 
            variant="outline" 
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistiche
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
