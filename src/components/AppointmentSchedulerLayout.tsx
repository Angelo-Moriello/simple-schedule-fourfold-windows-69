import React from 'react';
import { Appointment, Employee } from '@/types/appointment';
import AppointmentSchedulerHeader from './AppointmentSchedulerHeader';
import AppointmentSchedulerControls from './AppointmentSchedulerControls';
import EmployeeTimeSlotGrid from './EmployeeTimeSlotGrid';
interface AppointmentSchedulerLayoutProps {
  selectedDate: Date;
  employees: Employee[];
  appointments: Appointment[];
  showFullCalendar: boolean;
  onDateSelect: (date: Date | undefined) => void;
  onShowFullCalendar: (show: boolean) => void;
  onOpenEmployeeForm: () => void;
  onUpdateEmployeeVacations: (employeeId: number, vacations: string[]) => void;
  onNavigateToHistory: () => void;
  onNavigateToStatistics: () => void;
  onOpenClientManager: () => void;
  onAddAppointment: (employeeId: number, time: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onUpdateEmployeeName: (employeeId: number, newName: string) => void;
}
const AppointmentSchedulerLayout: React.FC<AppointmentSchedulerLayoutProps> = ({
  selectedDate,
  employees,
  appointments,
  showFullCalendar,
  onDateSelect,
  onShowFullCalendar,
  onOpenEmployeeForm,
  onUpdateEmployeeVacations,
  onNavigateToHistory,
  onNavigateToStatistics,
  onOpenClientManager,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onUpdateEmployeeName
}) => {
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-4 lg:py-6 bg-zinc-600 rounded-md">
        
        <AppointmentSchedulerHeader />

        <AppointmentSchedulerControls selectedDate={selectedDate} employees={employees} showFullCalendar={showFullCalendar} onDateSelect={onDateSelect} onShowFullCalendar={onShowFullCalendar} onOpenEmployeeForm={onOpenEmployeeForm} onUpdateEmployeeVacations={onUpdateEmployeeVacations} onNavigateToHistory={onNavigateToHistory} onNavigateToStatistics={onNavigateToStatistics} onOpenClientManager={onOpenClientManager} appointments={appointments} />

        <div className="backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-2 sm:p-4 lg:p-6 bg-stone-100">
          <EmployeeTimeSlotGrid employees={employees} appointments={appointments} selectedDate={selectedDate} onAddAppointment={onAddAppointment} onEditAppointment={onEditAppointment} onDeleteAppointment={onDeleteAppointment} onUpdateEmployeeName={onUpdateEmployeeName} />
        </div>
      </div>
    </div>;
};
export default AppointmentSchedulerLayout;