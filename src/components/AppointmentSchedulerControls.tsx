
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Users, History, BarChart3, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Employee, Appointment } from '@/types/appointment';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  appointments
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}
            </h2>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 px-3 gap-2 text-sm">
                📅 Cambia Data
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={onDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <Button 
          onClick={onOpenEmployeeForm}
          className="h-12 bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm"
        >
          <UserPlus className="h-4 w-4" />
          👨‍💼 Dipendenti
        </Button>

        <VacationManager 
          employees={employees}
          onUpdateEmployeeVacations={onUpdateEmployeeVacations}
        />

        <ServiceCategoryManager />

        <Button 
          onClick={onOpenClientManager}
          variant="outline" 
          className="h-12 px-3 gap-2 text-sm border-green-200 text-green-700 hover:bg-green-50"
        >
          👥 Clienti
        </Button>

        <Button 
          onClick={onNavigateToHistory}
          variant="outline" 
          className="h-12 px-3 gap-2 text-sm border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          📚 Storico
        </Button>

        <Button 
          onClick={onNavigateToStatistics}
          variant="outline" 
          className="h-12 px-3 gap-2 text-sm border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          📊 Statistiche
        </Button>
      </div>
    </div>
  );
};

export default AppointmentSchedulerControls;
