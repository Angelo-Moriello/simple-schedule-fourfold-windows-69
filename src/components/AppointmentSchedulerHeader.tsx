
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Users, LogOut } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
            alt="Da Capo a Piedi" 
            className="h-12 w-12 object-contain rounded-lg shadow-sm"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Sistema Appuntamenti
            </h1>
            <p className="text-gray-600 text-sm">Da Capo a Piedi</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-600">Benvenuto</p>
            <p className="font-medium text-gray-800">{user?.email}</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Appuntamenti Oggi</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{todayAppointments.length}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">💰</span>
            <span className="font-semibold text-green-800">Ricavi Stimati</span>
          </div>
          <p className="text-2xl font-bold text-green-900">€{totalRevenue}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Dipendenti</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{employees.length}</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSchedulerHeader;
