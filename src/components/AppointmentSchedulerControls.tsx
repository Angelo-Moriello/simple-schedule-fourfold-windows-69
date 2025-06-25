
import React from 'react';
import { Button } from '@/components/ui/button';
import { Employee, Appointment } from '@/types/appointment';
import VacationManager from './VacationManager';
import ServiceCategoryManager from './ServiceCategoryManager';
import DateNavigator from './DateNavigator';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

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
  onDateSelect,
  onOpenEmployeeForm,
  employees,
  onUpdateEmployeeVacations,
  onNavigateToHistory,
  onNavigateToStatistics,
  onOpenClientManager,
  appointments
}) => {
  // Calcola gli appuntamenti per la giornata selezionata
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const todayAppointments = appointments.filter(apt => apt.date === selectedDateString);
  const appointmentCount = todayAppointments.length;

  return (
    <div className="backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6 bg-stone-100">
      {/* Date Navigator Section with Appointment Counter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-4 mb-4 sm:mb-6">
        {/* Date Navigator */}
        <div className="flex justify-center">
          <DateNavigator selectedDate={selectedDate} onDateSelect={onDateSelect} />
        </div>

        {/* Appointment Counter - Mobile: centered below, Desktop: right of date */}
        <div className="flex justify-center lg:justify-start">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 sm:p-4 shadow-sm border border-blue-200">
            <div className="text-center lg:text-left">
              <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1 capitalize">
                {format(selectedDate, 'EEEE d MMMM', {
                  locale: it
                })}
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <span className="text-lg sm:text-xl">📅</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600">
                  {appointmentCount}
                </span>
                <span className="text-xs sm:text-sm text-gray-600 font-medium capitalize">
                  {appointmentCount === 1 ? 'appuntamento' : 'appuntamenti'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Button onClick={onOpenEmployeeForm} variant="secondary" size="lg" className="w-full gap-2">
          <span className="text-base">👥</span>
          <span className="text-xs sm:text-sm">Staff</span>
        </Button>

        <div className="h-12">
          <VacationManager employees={employees} onUpdateEmployeeVacations={onUpdateEmployeeVacations} />
        </div>

        <div className="h-12">
          <ServiceCategoryManager />
        </div>

        <Button onClick={onOpenClientManager} variant="secondary" size="lg" className="w-full gap-2">
          <span className="text-base">👤</span>
          <span className="text-xs sm:text-sm">Clienti</span>
        </Button>

        <Button onClick={onNavigateToHistory} variant="secondary" size="lg" className="w-full gap-2">
          <span className="text-base">📋</span>
          <span className="text-xs sm:text-sm">Storico</span>
        </Button>

        <Button onClick={onNavigateToStatistics} variant="secondary" size="lg" className="w-full gap-2">
          <span className="text-base">📊</span>
          <span className="text-xs sm:text-sm">Stats</span>
        </Button>
      </div>
    </div>
  );
};

export default AppointmentSchedulerControls;
