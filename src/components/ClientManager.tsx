
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Users, Plus, Phone, Mail, Calendar, Clock, User } from 'lucide-react';
import { Client } from '@/types/client';
import { loadClientsFromSupabase } from '@/utils/clientStorage';
import ClientForm from './ClientForm';
import ClientDetailDialog from './ClientDetailDialog';

interface ClientManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClientManager: React.FC<ClientManagerProps> = ({ isOpen, onClose }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isClientDetailOpen, setIsClientDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      console.log('DEBUG - ClientManager aperto, caricamento clienti...');
      loadClients();
    }
  }, [isOpen]);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      console.log('DEBUG - Caricamento clienti da Supabase...');
      const loadedClients = await loadClientsFromSupabase();
      console.log('DEBUG - Clienti caricati:', loadedClients.length, loadedClients);
      setClients(loadedClients);
    } catch (error) {
      console.error('DEBUG - Errore nel caricamento clienti:', error);
      toast.error('Errore nel caricamento dei clienti');
    } finally {
      setIsLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.includes(searchTerm))
    );
    setFilteredClients(filtered);
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsClientDetailOpen(true);
  };

  const handleClientAdded = () => {
    loadClients();
    setIsClientFormOpen(false);
    toast.success('Cliente aggiunto con successo!');
  };

  const handleClientUpdated = () => {
    loadClients();
    setIsClientDetailOpen(false);
    toast.success('Cliente aggiornato con successo!');
  };

  const handleClientDeleted = () => {
    loadClients();
    setIsClientDetailOpen(false);
    toast.success('Cliente eliminato con successo!');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-full overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <div className="bg-blue-100 rounded-full p-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              Gestione Clienti
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {/* Search and Add */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cerca cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              <Button
                onClick={() => setIsClientFormOpen(true)}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nuovo Cliente</span>
                <span className="sm:hidden">Nuovo</span>
              </Button>
            </div>

            {/* Clients List */}
            <div className="flex-1 overflow-hidden">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-sm">Caricamento clienti...</p>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm">
                    {searchTerm ? 'Nessun cliente trovato' : 'Nessun cliente presente'}
                  </p>
                </div>
              ) : (
                <div className="overflow-y-auto h-full space-y-2 sm:space-y-3 pr-2">
                  {filteredClients.map((client) => (
                    <Card
                      key={client.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-gray-50"
                      onClick={() => handleClientClick(client)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <div className="bg-blue-100 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                              <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{client.name}</h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                {client.email && (
                                  <div className="flex items-center gap-1 min-w-0">
                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{client.email}</span>
                                  </div>
                                )}
                                {client.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                    <span>{client.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              Cliente
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ClientForm
        isOpen={isClientFormOpen}
        onClose={() => setIsClientFormOpen(false)}
        onClientAdded={handleClientAdded}
      />

      {selectedClient && (
        <ClientDetailDialog
          isOpen={isClientDetailOpen}
          onClose={() => setIsClientDetailOpen(false)}
          client={selectedClient}
          onClientUpdated={handleClientUpdated}
          onClientDeleted={handleClientDeleted}
        />
      )}
    </>
  );
};

export default ClientManager;
