
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Scissors, Users } from 'lucide-react';
import VacationManager from './VacationManager';
import ServiceCategoryManager from './ServiceCategoryManager';
import DateNavigator from './DateNavigator';
import { Employee } from '@/types/appointment';

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
  onNavigateToStatistics
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md mb-6">
      {/* Prima riga: Navigazione data */}
      <div className="flex items-center justify-center">
        <DateNavigator
          selectedDate={selectedDate}
          showFullCalendar={showFullCalendar}
          onDateSelect={onDateSelect}
          onShowFullCalendar={onShowFullCalendar}
        />
      </div>
      
      {/* Seconda riga: Tutti i pulsanti con stile uniforme */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Button 
          variant="outline" 
          className="h-10 px-3 gap-2 text-sm"
          onClick={onNavigateToHistory}
        >
          <Clock className="h-4 w-4" />
          Storico
        </Button>
        
        <Button 
          variant="outline" 
          className="h-10 px-3 gap-2 text-sm"
          onClick={onNavigateToStatistics}
        >
          <TrendingUp className="h-4 w-4" />
          Statistiche
        </Button>
        
        <ServiceCategoryManager />
        
        <VacationManager 
          employees={employees}
          onUpdateEmployeeVacations={onUpdateEmployeeVacations}
        />
        
        <Button 
          onClick={onOpenEmployeeForm} 
          className="h-10 px-3 gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Users className="h-4 w-4" />
          Gestisci Dipendenti
        </Button>
      </div>
    </div>
  );
};

export default AppointmentSchedulerControls;
