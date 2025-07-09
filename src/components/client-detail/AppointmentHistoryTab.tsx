
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
    console.log('DEBUG - Funzione handleDeleteAppointment chiamata:', appointmentId);
    
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

  console.log('DEBUG - AppointmentHistoryTab render:', { 
    appointments: appointments?.length, 
    isLoading 
  });

  return (
    <TooltipProvider>
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
            {appointments.map((appointment) => {
              console.log('DEBUG - Rendering appointment:', appointment.id);
              return (
                <Card key={appointment.id} className="border-2 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Header con informazioni appuntamento */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: appointment.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {appointment.title || appointment.serviceType}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(appointment.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(appointment.time)} ({appointment.duration}min)
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {appointment.serviceType}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Pulsante Elimina - SEMPRE VISIBILE */}
                      <div className="flex-shrink-0 ml-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                console.log('DEBUG - Click pulsante elimina per:', appointment.id);
                                handleDeleteAppointment(
                                  appointment.id, 
                                  `${formatDate(appointment.date)} alle ${formatTime(appointment.time)}`
                                );
                              }}
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
                    
                    {/* Note se presenti */}
                    {appointment.notes && (
                      <div className="mt-3 pl-7">
                        <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                          {appointment.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AppointmentHistoryTab;
