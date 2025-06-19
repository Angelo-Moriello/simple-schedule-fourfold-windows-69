
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Employee, Appointment } from '@/types/appointment';

interface AppointmentSchedulerHeaderProps {
  selectedDate: Date;
  employees: Employee[];
  appointments: Appointment[];
  onShowFullCalendar: () => void;
}

const AppointmentSchedulerHeader: React.FC<AppointmentSchedulerHeaderProps> = ({
  selectedDate,
  employees,
  appointments,
  onShowFullCalendar
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <img 
            src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
            alt="Da Capo a Piedi - Estetica & Parrucchieri" 
            className="h-12 w-12 sm:h-16 sm:w-16 object-contain rounded-lg shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Calendario Appuntamenti
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: it })}
            </p>
            <p className="text-xs text-gray-500">
              {employees.length} dipendenti • {appointments.length} appuntamenti totali
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={() => navigate('/history')}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 h-10 sm:h-12 px-4 sm:px-6"
          >
            <Clock className="h-4 w-4 mr-2" />
            Storico
          </Button>
          <Button 
            onClick={onShowFullCalendar}
            variant="outline"
            className="w-full sm:w-auto h-10 sm:h-12 px-4 sm:px-6"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Vista Mese
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSchedulerHeader;
