
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Employee, Appointment } from '@/types/appointment';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AppointmentSchedulerHeaderProps {
  selectedDate: Date;
  employees: Employee[];
  appointments: Appointment[];
}

const AppointmentSchedulerHeader: React.FC<AppointmentSchedulerHeaderProps> = ({
  selectedDate,
  employees,
  appointments
}) => {
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Force clear localStorage and reload page for mobile
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth';
      toast.success('Logout effettuato con successo');
    } catch (error) {
      console.error('Errore logout:', error);
      toast.error('Errore durante il logout');
    }
  };

  const todayAppointments = appointments.filter(app => app.date === format(selectedDate, 'yyyy-MM-dd'));

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-300 via-purple-300 to-slate-300 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-pink-200/20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-stone-100">
        <div className="absolute top-4 sm:top-10 left-4 sm:left-10 w-20 sm:w-32 h-20 sm:h-32 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 sm:bottom-10 right-4 sm:right-10 w-24 sm:w-40 h-24 sm:h-40 bg-purple-300/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 lg:gap-8 w-full lg:w-auto">
            <div className="relative">
              <img 
                src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
                alt="Da Capo a Piedi" 
                className="h-32 w-32 sm:h-40 sm:w-40 lg:h-48 lg:w-48 xl:h-56 xl:w-56 object-contain rounded-3xl shadow-2xl bg-white/30 backdrop-blur-sm p-3 lg:p-4 border-2 border-white/40" 
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
            </div>
            <div className="text-center sm:text-left w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 mb-1 sm:mb-2">
                Sistema Appuntamenti
              </h1>
              <p className="text-slate-700 text-lg sm:text-xl font-medium mb-2 sm:mb-3">Da Capo a Piedi</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full lg:w-auto">
            <div className="text-center sm:text-right backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 w-full sm:w-auto bg-white">
              <p className="text-xs sm:text-sm text-slate-700 mb-1">Benvenuto</p>
              <p className="font-bold text-slate-800 text-sm sm:text-lg break-all sm:break-normal">{user?.email}</p>
            </div>
            <Button onClick={handleLogout} variant="destructive" size="lg" className="w-full sm:w-auto gap-2">
              <span className="text-base">🚪</span>
              <span className="text-sm">Logout</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="group bg-gradient-to-br from-blue-200/30 to-blue-300/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-300/40 hover:border-blue-400/60 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-blue-400/40 rounded-xl">
                  <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-blue-700" />
                </div>
                <span className="font-bold text-blue-800 text-sm sm:text-lg">Appuntamenti Oggi</span>
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-bold text-slate-800 mb-1 sm:mb-2">{todayAppointments.length}</p>
            <p className="text-blue-700 text-xs sm:text-sm">
              {todayAppointments.length === 1 ? 'appuntamento programmato' : 'appuntamenti programmati'}
            </p>
          </div>

          <div className="group bg-gradient-to-br from-purple-200/30 to-purple-300/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-300/40 hover:border-purple-400/60 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-purple-400/40 rounded-xl">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-purple-700" />
                </div>
                <span className="font-bold text-purple-800 text-sm sm:text-lg">Staff Attivo</span>
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-bold text-slate-800 mb-1 sm:mb-2">{employees.length}</p>
            <p className="text-purple-700 text-xs sm:text-sm">
              {employees.length === 1 ? 'dipendente disponibile' : 'dipendenti disponibili'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSchedulerHeader;
