
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: appointment.color }}
                    ></div>
                    <div className="flex-1">
                      <h4 className="font-medium">
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
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {appointment.serviceType}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAppointment(
                        appointment.id, 
                        `${formatDate(appointment.date)} alle ${formatTime(appointment.time)}`
                      )}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {appointment.notes && (
                  <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentHistoryTab;
