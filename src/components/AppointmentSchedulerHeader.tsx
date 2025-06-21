
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
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          {/* Logo e titolo - responsive layout */}
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-center sm:text-left">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/30 flex-shrink-0">
              <img 
                src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
                alt="Beauty Scheduler Logo" 
                className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-32 lg:w-32 xl:h-36 xl:w-36 object-contain" 
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
                Da Capo a Piedi
              </h1>
              <p className="text-blue-200 text-sm sm:text-base md:text-lg lg:text-xl font-medium mt-1 md:mt-2">
                Sistema di Gestione Appuntamenti Professionale
              </p>
            </div>
          </div>

          {/* Stats cards - responsive grid */}
          <div className="flex flex-row space-x-2 sm:space-x-3 lg:space-x-4 w-full lg:w-auto justify-center lg:justify-end">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]">
              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-300" />
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {format(selectedDate, 'dd', { locale: it })}
                  </p>
                  <p className="text-blue-200 text-xs sm:text-sm uppercase">
                    {format(selectedDate, 'MMM yyyy', { locale: it })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]">
              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-300" />
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{employees.length}</p>
                  <p className="text-blue-200 text-xs sm:text-sm">Dipendenti</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]">
              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-300" />
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{todayAppointments.length}</p>
                  <p className="text-blue-200 text-xs sm:text-sm">Oggi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data selezionata con formato corretto */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20 text-center lg:text-left">
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 font-medium uppercase">
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
