
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  User, Mail, Phone, FileText, Calendar, Clock, 
  Edit, Trash2, Plus, History, Repeat 
} from 'lucide-react';
import { Client } from '@/types/client';
import { Appointment } from '@/types/appointment';
import { 
  updateClientInSupabase, 
  deleteClientFromSupabase,
  getClientAppointmentsFromSupabase 
} from '@/utils/clientStorage';
import RecurringTreatmentForm from './RecurringTreatmentForm';
import RecurringTreatmentsList from './RecurringTreatmentsList';

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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(client);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isRecurringFormOpen, setIsRecurringFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(client);
      loadAppointmentHistory();
    }
  }, [isOpen, client]);

  const loadAppointmentHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const clientAppointments = await getClientAppointmentsFromSupabase(client.id);
      setAppointments(clientAppointments);
    } catch (error) {
      console.error('Errore nel caricamento storico:', error);
      toast.error('Errore nel caricamento dello storico appuntamenti');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Il nome del cliente è obbligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateClientInSupabase({
        ...formData,
        name: formData.name.trim(),
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        notes: formData.notes?.trim() || undefined
      });
      
      setIsEditing(false);
      onClientUpdated();
    } catch (error) {
      console.error('Errore nell\'aggiornamento del cliente:', error);
      toast.error('Errore nell\'aggiornare il cliente');
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

  return (
    <>
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
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifica
                  </Button>
                )}
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
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome *
                    </Label>
                    <Input
                      id="edit-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefono
                    </Label>
                    <Input
                      id="edit-phone"
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-notes" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Note
                    </Label>
                    <Textarea
                      id="edit-notes"
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(client);
                      }}
                    >
                      Annulla
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="text-sm text-gray-600">{client.email || 'Non specificata'}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-4 w-4" />
                        Telefono
                      </Label>
                      <p className="text-sm text-gray-600">{client.phone || 'Non specificato'}</p>
                    </div>
                  </div>
                  
                  {client.notes && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4" />
                        Note
                      </Label>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{client.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Storico Appuntamenti
                </h3>
                <Badge variant="outline">
                  {appointments.length} appuntamenti
                </Badge>
              </div>

              {isLoadingHistory ? (
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
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: appointment.color }}
                            ></div>
                            <div>
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
                          <Badge variant="outline">
                            {appointment.serviceType}
                          </Badge>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recurring" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Repeat className="h-5 w-5" />
                  Trattamenti Ricorrenti
                </h3>
                <Button
                  onClick={() => setIsRecurringFormOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Trattamento
                </Button>
              </div>

              <RecurringTreatmentsList clientId={client.id} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <RecurringTreatmentForm
        isOpen={isRecurringFormOpen}
        onClose={() => setIsRecurringFormOpen(false)}
        clientId={client.id}
        onTreatmentAdded={() => {
          setIsRecurringFormOpen(false);
          toast.success('Trattamento ricorrente aggiunto con successo!');
        }}
      />
    </>
  );
};

export default ClientDetailDialog;
