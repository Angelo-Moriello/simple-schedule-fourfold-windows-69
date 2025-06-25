
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, UserPlus, CalendarDays } from 'lucide-react';
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
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6 mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {format(selectedDate, 'EEEE d MMMM', { locale: it })}
              </h2>
              <p className="text-gray-600 text-sm">{format(selectedDate, 'yyyy', { locale: it })}</p>
            </div>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-12 px-6 gap-3 text-sm bg-white/70 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 rounded-xl shadow-md"
              >
                <Calendar className="h-4 w-4" />
                Cambia Data
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-lg border-2" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={onDateSelect}
                initialFocus
                className="rounded-xl"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Button 
          onClick={onOpenEmployeeForm}
          className="h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <UserPlus className="h-5 w-5" />
          <span className="hidden sm:inline">Gestisci</span> Staff
        </Button>

        <div className="h-14">
          <VacationManager 
            employees={employees}
            onUpdateEmployeeVacations={onUpdateEmployeeVacations}
          />
        </div>

        <div className="h-14">
          <ServiceCategoryManager />
        </div>

        <Button 
          onClick={onOpenClientManager}
          className="h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          👥 <span className="hidden sm:inline">Gestisci</span> Clienti
        </Button>

        <Button 
          onClick={onNavigateToHistory}
          className="h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white gap-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          📚 <span className="hidden sm:inline">Visualizza</span> Storico
        </Button>

        <Button 
          onClick={onNavigateToStatistics}
          className="h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          📊 <span className="hidden sm:inline">Visualizza</span> Stats
        </Button>
      </div>
    </div>
  );
};

export default AppointmentSchedulerControls;
