
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

  const buttonStyles = "h-12 px-6 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl p-8 mb-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-8">
          <div className="flex items-center gap-8">
            <div className="relative">
              <img 
                src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
                alt="Da Capo a Piedi" 
                className="h-36 w-36 object-contain rounded-3xl shadow-2xl bg-white/20 backdrop-blur-sm p-4 border-2 border-white/30"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                Sistema Appuntamenti
              </h1>
              <p className="text-blue-200 text-xl font-medium mb-3">Da Capo a Piedi</p>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-purple-200 text-lg hover:text-white transition-colors duration-300 cursor-pointer underline decoration-purple-300 hover:decoration-white">
                    {format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white shadow-xl border-0 rounded-xl" align="start">
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

          <div className="flex items-center gap-6">
            <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-blue-200 mb-1">Benvenuto</p>
              <p className="font-bold text-white text-lg">{user?.email}</p>
            </div>
            <Button 
              onClick={handleLogout}
              className={`${buttonStyles} bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 gap-3`}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group bg-gradient-to-br from-blue-500/20 to-blue-600/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/30 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-200" />
                </div>
                <span className="font-bold text-blue-100 text-lg">Appuntamenti Oggi</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{todayAppointments.length}</p>
            <p className="text-blue-200 text-sm">
              {todayAppointments.length === 1 ? 'appuntamento programmato' : 'appuntamenti programmati'}
            </p>
          </div>

          <div className="group bg-gradient-to-br from-purple-500/20 to-purple-600/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/30 rounded-xl">
                  <Users className="h-6 w-6 text-purple-200" />
                </div>
                <span className="font-bold text-purple-100 text-lg">Staff Attivo</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{employees.length}</p>
            <p className="text-purple-200 text-sm">
              {employees.length === 1 ? 'dipendente disponibile' : 'dipendenti disponibili'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSchedulerHeader;
