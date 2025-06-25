
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Users, LogOut, TrendingUp } from 'lucide-react';
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
      toast.success('Logout effettuato con successo');
    } catch (error) {
      toast.error('Errore durante il logout');
    }
  };

  const todayAppointments = appointments.filter(app => app.date === format(selectedDate, 'yyyy-MM-dd'));
  const totalRevenue = todayAppointments.reduce((sum, app) => {
    const serviceTypePrices: { [key: string]: number } = {
      'Taglio': 30,
      'Piega': 25,
      'Colore': 60,
      'Trattamento': 40,
      'Manicure': 20,
      'Pedicure': 25,
      'Ceretta': 15,
      'Pulizia viso': 35,
      'Massaggio': 50,
      'Altro': 30
    };
    return sum + (serviceTypePrices[app.serviceType] || 30);
  }, 0);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl p-6 mb-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
                alt="Da Capo a Piedi" 
                className="h-16 w-16 object-contain rounded-2xl shadow-lg bg-white/10 backdrop-blur-sm p-2"
              />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                Sistema Appuntamenti
              </h1>
              <p className="text-blue-200 text-lg font-medium">Da Capo a Piedi</p>
              <p className="text-purple-200 text-sm">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-blue-200 mb-1">Benvenuto</p>
              <p className="font-bold text-white text-lg">{user?.email}</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="lg"
              className="gap-2 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <div className="group bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 backdrop-blur-sm rounded-2xl p-6 border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/30 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-emerald-200" />
                </div>
                <span className="font-bold text-emerald-100 text-lg">Ricavi Stimati</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">€{totalRevenue}</p>
            <p className="text-emerald-200 text-sm">per la giornata odierna</p>
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
