
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Users, LogOut } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Employee, Appointment } from '@/types/appointment';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AppointmentSchedulerHeaderProps {
  selectedDate: Date;
  employees: Employee[];
  appointments: Appointment[];
  onDateSelect: (date: Date | undefined) => void;
}

const AppointmentSchedulerHeader: React.FC<AppointmentSchedulerHeaderProps> = ({
  selectedDate,
  employees,
  appointments,
  onDateSelect
}) => {
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout effettuato con successo');
    } catch (error) {
      toast.error('Errore durante il logout');
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
    }
  };

  const todayAppointments = appointments.filter(app => app.date === format(selectedDate, 'yyyy-MM-dd'));

  // Unified button styles
  const buttonStyles = "h-12 px-4 text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-4 sm:top-10 left-4 sm:left-10 w-20 sm:w-32 h-20 sm:h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 sm:bottom-10 right-4 sm:right-10 w-24 sm:w-40 h-24 sm:h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8 w-full lg:w-auto">
            <div className="relative mx-auto sm:mx-0">
              <img 
                src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
                alt="Da Capo a Piedi" 
                className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 object-contain rounded-3xl shadow-2xl bg-white/20 backdrop-blur-sm p-3 lg:p-4 border-2 border-white/30"
              />
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-2 sm:border-3 border-white shadow-lg animate-pulse"></div>
            </div>
            <div className="text-center sm:text-left w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2">
                Sistema Appuntamenti
              </h1>
              <p className="text-blue-200 text-lg sm:text-xl font-medium mb-2 sm:mb-3">Da Capo a Piedi</p>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-purple-200 text-base sm:text-lg hover:text-white transition-colors duration-300 cursor-pointer underline decoration-purple-300 hover:decoration-white">
                    {format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white shadow-xl border-0 rounded-xl z-50" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="p-3 pointer-events-auto bg-white rounded-xl"
                    locale={it}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full lg:w-auto">
            <div className="text-center sm:text-right bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 w-full sm:w-auto">
              <p className="text-xs sm:text-sm text-blue-200 mb-1">Benvenuto</p>
              <p className="font-bold text-white text-sm sm:text-lg break-all sm:break-normal">{user?.email}</p>
            </div>
            <Button 
              onClick={handleLogout}
              className={`${buttonStyles} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white gap-2 sm:gap-3 w-full sm:w-auto`}
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Logout</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="group bg-gradient-to-br from-blue-500/20 to-blue-600/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-blue-500/30 rounded-xl">
                  <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-blue-200" />
                </div>
                <span className="font-bold text-blue-100 text-sm sm:text-lg">Appuntamenti Oggi</span>
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">{todayAppointments.length}</p>
            <p className="text-blue-200 text-xs sm:text-sm">
              {todayAppointments.length === 1 ? 'appuntamento programmato' : 'appuntamenti programmati'}
            </p>
          </div>

          <div className="group bg-gradient-to-br from-purple-500/20 to-purple-600/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-purple-500/30 rounded-xl">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-purple-200" />
                </div>
                <span className="font-bold text-purple-100 text-sm sm:text-lg">Staff Attivo</span>
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">{employees.length}</p>
            <p className="text-purple-200 text-xs sm:text-sm">
              {employees.length === 1 ? 'dipendente disponibile' : 'dipendenti disponibili'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSchedulerHeader;
