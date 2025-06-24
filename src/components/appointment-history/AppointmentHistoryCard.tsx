
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Calendar, Clock, Mail, Phone, Scissors } from 'lucide-react';
import { Appointment, Employee } from '@/types/appointment';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface AppointmentHistoryCardProps {
  appointment: Appointment;
  getEmployeeName: (employeeId: number) => string;
  getEmployeeSpecialization: (employeeId: number) => string;
}

const AppointmentHistoryCard: React.FC<AppointmentHistoryCardProps> = ({
  appointment,
  getEmployeeName,
  getEmployeeSpecialization,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr || typeof dateStr !== 'string') return 'Data non valida';
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: it });
    } catch (error) {
      console.error('Errore nel formatting della data:', dateStr, error);
      return dateStr || 'Data non valida';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                  {appointment.client || 'Cliente sconosciuto'}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {getEmployeeName(appointment.employeeId)} ({getEmployeeSpecialization(appointment.employeeId)})
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {formatDate(appointment.date)}
                </p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <p className="text-xs sm:text-sm text-gray-600">
                    {appointment.time} ({appointment.duration} min)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-purple-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                  {appointment.serviceType || 'Non specificato'}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {appointment.title || 'Senza titolo'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {appointment.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-gray-500 shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600 truncate">{appointment.email}</p>
              </div>
            )}
            {appointment.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-gray-500 shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600 truncate">{appointment.phone}</p>
              </div>
            )}
            {appointment.notes && (
              <p className="text-xs text-gray-500 truncate">Note: {appointment.notes}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentHistoryCard;
