
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User, Calendar, Clock, Mail, Phone, Scissors, Trash2 } from 'lucide-react';
import { Appointment, Employee } from '@/types/appointment';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { deleteAppointmentFromSupabase } from '@/utils/supabase/appointmentMutations';
import { toast } from 'sonner';

interface AppointmentHistoryCardProps {
  appointment: Appointment;
  getEmployeeName: (employeeId: number) => string;
  getEmployeeSpecialization: (employeeId: number) => string;
  onAppointmentDeleted?: () => void;
}

const AppointmentHistoryCard: React.FC<AppointmentHistoryCardProps> = ({
  appointment,
  getEmployeeName,
  getEmployeeSpecialization,
  onAppointmentDeleted,
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

  const handleDeleteAppointment = async () => {
    const appointmentInfo = `${formatDate(appointment.date)} alle ${appointment.time}`;
    
    if (!confirm(`Sei sicuro di voler eliminare l'appuntamento del ${appointmentInfo}? Questa azione non può essere annullata.`)) {
      return;
    }

    try {
      await deleteAppointmentFromSupabase(appointment.id);
      toast.success('Appuntamento eliminato con successo!');
      if (onAppointmentDeleted) {
        onAppointmentDeleted();
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'appuntamento:', error);
      toast.error('Errore nell\'eliminare l\'appuntamento');
    }
  };

  return (
    <TooltipProvider>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 flex-1">
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
          
          {/* Pulsante Elimina */}
          <div className="flex-shrink-0 ml-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAppointment}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-xs font-medium flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Elimina
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Elimina questo appuntamento</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default AppointmentHistoryCard;
