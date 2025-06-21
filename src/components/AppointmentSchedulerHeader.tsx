
import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar, Users, Clock, Sparkles } from 'lucide-react';
import { Employee, Appointment } from '@/types/appointment';

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
  const todayAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return format(appointmentDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  });

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-blue-800 to-purple-900 text-white shadow-2xl mb-8 rounded-2xl overflow-hidden">
      <div className="px-4 md:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          {/* Logo e titolo - responsive layout */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-white/30">
              <img 
                src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
                alt="Beauty Scheduler Logo" 
                className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 object-contain" 
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Da Capo a Piedi
              </h1>
              <p className="text-blue-200 text-lg md:text-xl font-medium mt-1 md:mt-2">
                Sistema di Gestione Appuntamenti Professionale
              </p>
            </div>
          </div>

          {/* Stats cards - responsive grid */}
          <div className="flex flex-row md:flex-row space-x-3 md:space-x-6 w-full md:w-auto justify-center md:justify-end">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 min-w-[100px] md:min-w-[120px]">
              <div className="flex items-center space-x-2 md:space-x-3">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-blue-300" />
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {format(selectedDate, 'dd', { locale: it })}
                  </p>
                  <p className="text-blue-200 text-xs md:text-sm uppercase">
                    {format(selectedDate, 'MMM yyyy', { locale: it })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 min-w-[100px] md:min-w-[120px]">
              <div className="flex items-center space-x-2 md:space-x-3">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-green-300" />
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">{employees.length}</p>
                  <p className="text-blue-200 text-xs md:text-sm">Dipendenti</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 min-w-[100px] md:min-w-[120px]">
              <div className="flex items-center space-x-2 md:space-x-3">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-purple-300" />
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">{todayAppointments.length}</p>
                  <p className="text-blue-200 text-xs md:text-sm">Oggi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data selezionata con formato corretto */}
        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/20 text-center md:text-left">
          <p className="text-lg md:text-xl text-blue-100 font-medium uppercase">
            {format(selectedDate, "EEEE, d MMMM yyyy", { locale: it })}
          </p>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
    </div>
  );
};

export default AppointmentSchedulerHeader;
