
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from 'lucide-react';
import VacationManager from './VacationManager';
import ServiceCategoryManager from './ServiceCategoryManager';
import { Employee } from '@/types/appointment';

interface AppointmentSchedulerControlsProps {
  selectedDate: Date;
  employees: Employee[];
  showFullCalendar: boolean;
  onDateSelect: (date: Date | undefined) => void;
  onShowFullCalendar: (show: boolean) => void;
  onOpenEmployeeForm: () => void;
  onUpdateEmployeeVacations: (employeeId: number, vacations: string[]) => void;
}

const AppointmentSchedulerControls: React.FC<AppointmentSchedulerControlsProps> = ({
  selectedDate,
  employees,
  showFullCalendar,
  onDateSelect,
  onShowFullCalendar,
  onOpenEmployeeForm,
  onUpdateEmployeeVacations
}) => {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow-md mb-6">
      <div className="flex items-center gap-3">
        <Popover open={showFullCalendar} onOpenChange={onShowFullCalendar}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 px-3">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Seleziona Data</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              captionLayout="dropdown"
              defaultMonth={selectedDate}
              selected={selectedDate}
              onSelect={onDateSelect}
              className="rounded-md border-0"
              style={{ width: '100%' }}
            />
          </PopoverContent>
        </Popover>
        <VacationManager 
          employees={employees}
          onUpdateEmployeeVacations={onUpdateEmployeeVacations}
        />
        <ServiceCategoryManager />
      </div>
      <Button onClick={onOpenEmployeeForm} className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3">
        Gestisci Dipendenti
      </Button>
    </div>
  );
};

export default AppointmentSchedulerControls;
