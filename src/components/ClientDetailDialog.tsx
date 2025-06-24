
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User, Edit, Trash2 } from 'lucide-react';
import { Client } from '@/types/client';
import { Appointment } from '@/types/appointment';
import { 
  updateClientInSupabase, 
  deleteClientFromSupabase,
  getClientAppointmentsFromSupabase 
} from '@/utils/clientStorage';
import ClientInfoTab from './client-detail/ClientInfoTab';
import AppointmentHistoryTab from './client-detail/AppointmentHistoryTab';
import RecurringTreatmentsTab from './client-detail/RecurringTreatmentsTab';

interface ClientDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onClientUpdated: () => void;
  onClientDeleted: () => void;
}

const ClientDetailDialog: React.FC<ClientDetailDialogProps> = ({
  isOpen,
  onClose,
  client,
  onClientUpdated,
  onClientDeleted
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAppointmentHistory();
    }
  }, [isOpen, client]);

  useEffect(() => {
    if (isOpen) {
      const reloadInterval = setInterval(() => {
        loadAppointmentHistory();
      }, 5000);
      
      return () => clearInterval(reloadInterval);
    }
  }, [isOpen]);

  const loadAppointmentHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const clientAppointments = await getClientAppointmentsFromSupabase(client.id);
      console.log('DEBUG - Storico appuntamenti caricato per cliente:', client.id, clientAppointments.length);
      setAppointments(clientAppointments);
    } catch (error) {
      console.error('Errore nel caricamento storico:', error);
      toast.error('Errore nel caricamento dello storico appuntamenti');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpdate = async (updatedClient: Client) => {
    try {
      setIsSubmitting(true);
      await updateClientInSupabase(updatedClient);
      onClientUpdated();
      toast.success('Cliente aggiornato con successo!');
    } catch (error) {
      console.error('Errore nell\'aggiornamento del cliente:', error);
      toast.error('Errore nell\'aggiornare il cliente');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente? Questa azione non può essere annullata.')) {
      return;
    }

    try {
      await deleteClientFromSupabase(client.id);
      onClientDeleted();
    } catch (error) {
      console.error('Errore nell\'eliminazione del cliente:', error);
      toast.error('Errore nell\'eliminare il cliente');
    }
  };

  const handleTreatmentAdded = () => {
    toast.success('Trattamento ricorrente aggiunto con successo!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 rounded-full p-2">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              {client.name}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDelete}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Elimina
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informazioni</TabsTrigger>
            <TabsTrigger value="history">Storico Appuntamenti</TabsTrigger>
            <TabsTrigger value="recurring">Trattamenti Ricorrenti</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <ClientInfoTab
              client={client}
              onUpdate={handleUpdate}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <AppointmentHistoryTab
              appointments={appointments}
              isLoading={isLoadingHistory}
            />
          </TabsContent>

          <TabsContent value="recurring" className="space-y-4">
            <RecurringTreatmentsTab
              clientId={client.id}
              onTreatmentAdded={handleTreatmentAdded}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailDialog;
