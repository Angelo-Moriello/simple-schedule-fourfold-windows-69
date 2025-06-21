
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
      <div className="px-8 py-8">
        <div className="flex items-center justify-between">
          {/* Logo e titolo allineati a sinistra */}
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
              <Sparkles className="h-12 w-12 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Beauty Scheduler
              </h1>
              <p className="text-blue-200 text-lg font-medium mt-1">
                Sistema di Gestione Appuntamenti Professionale
              </p>
            </div>
          </div>

          {/* Stats cards */}
          <div className="flex space-x-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 min-w-[120px]">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-blue-300" />
                <div>
                  <p className="text-2xl font-bold text-white">{format(selectedDate, 'dd', { locale: it })}</p>
                  <p className="text-blue-200 text-sm">{format(selectedDate, 'MMM yyyy', { locale: it })}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 min-w-[120px]">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-green-300" />
                <div>
                  <p className="text-2xl font-bold text-white">{employees.length}</p>
                  <p className="text-blue-200 text-sm">Dipendenti</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 min-w-[120px]">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-purple-300" />
                <div>
                  <p className="text-2xl font-bold text-white">{todayAppointments.length}</p>
                  <p className="text-blue-200 text-sm">Oggi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data selezionata */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-xl text-blue-100 font-medium">
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
