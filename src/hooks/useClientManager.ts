
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Client } from '@/types/client';
import { loadClientsFromSupabase } from '@/utils/clientStorage';

export const useClientManager = (isOpen: boolean) => {
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

  return {
    clients,
    filteredClients,
    searchTerm,
    setSearchTerm,
    selectedClient,
    isClientFormOpen,
    setIsClientFormOpen,
    isClientDetailOpen,
    setIsClientDetailOpen,
    isLoading,
    handleClientClick,
    handleClientAdded,
    handleClientUpdated,
    handleClientDeleted
  };
};
