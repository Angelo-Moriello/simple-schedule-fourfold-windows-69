
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Clock, History, Trash2 } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { deleteAppointmentFromSupabase } from '@/utils/supabase/appointmentMutations';
import { toast } from 'sonner';

interface AppointmentHistoryTabProps {
  appointments: Appointment[];
  isLoading: boolean;
  onAppointmentDeleted?: () => void;
}

const AppointmentHistoryTab: React.FC<AppointmentHistoryTabProps> = ({
  appointments,
  isLoading,
  onAppointmentDeleted
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const handleDeleteAppointment = async (appointmentId: string, appointmentInfo: string) => {
    if (!confirm(`Sei sicuro di voler eliminare l'appuntamento del ${appointmentInfo}? Questa azione non può essere annullata.`)) {
      return;
    }

    try {
      console.log('Eliminazione appuntamento:', appointmentId);
      await deleteAppointmentFromSupabase(appointmentId);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5" />
          Storico Appuntamenti
        </h3>
        <Badge variant="outline">
          {appointments.length} appuntamenti
        </Badge>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento storico...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nessun appuntamento trovato</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <TooltipProvider>
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="relative hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    {/* Header con info appuntamento */}
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: appointment.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {appointment.title || appointment.serviceType}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(appointment.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(appointment.time)} ({appointment.duration}min)
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {appointment.serviceType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Note se presenti */}
                    {appointment.notes && (
                      <div className="pl-7">
                        <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">{appointment.notes}</p>
                      </div>
                    )}
                    
                    {/* Pulsante di eliminazione */}
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAppointment(
                              appointment.id, 
                              `${formatDate(appointment.date)} alle ${formatTime(appointment.time)}`
                            )}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
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
            ))}
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistoryTab;
