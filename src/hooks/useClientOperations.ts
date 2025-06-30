
import { loadClientsFromSupabase, addClientToSupabase } from '@/utils/clientStorage';

export const useClientOperations = () => {
  const findExistingClient = async (clientName: string, email?: string, phone?: string) => {
    const existingClients = await loadClientsFromSupabase();
    console.log('DEBUG - Ricerca cliente esistente:', { clientName, email, phone });
    
    // First, try to find by exact name match (case insensitive, trimmed)
    let existingClient = existingClients.find(client => 
      client.name.toLowerCase().trim() === clientName.toLowerCase().trim()
    );
    
    if (existingClient) {
      console.log('DEBUG - Cliente trovato per name:', existingClient);
      return existingClient;
    }
    
    // If no name match and we have email or phone, try to find by those
    if (email?.trim()) {
      existingClient = existingClients.find(client => 
        client.email && client.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
      if (existingClient) {
        console.log('DEBUG - Cliente trovato per email:', existingClient);
        return existingClient;
      }
    }
    
    if (phone?.trim()) {
      existingClient = existingClients.find(client => 
        client.phone && client.phone.trim() === phone.trim()
      );
      if (existingClient) {
        console.log('DEBUG - Cliente trovato per telefono:', existingClient);
        return existingClient;
      }
    }
    
    console.log('DEBUG - Nessun cliente esistente trovato');
    return null;
  };

  const createNewClient = async (clientData: {
    name: string;
    email?: string;
    phone?: string;
  }) => {
    console.log('DEBUG - Creazione nuovo cliente');
    try {
      const newClientData = {
        name: clientData.name.trim(),
        email: clientData.email?.trim() || undefined,
        phone: clientData.phone?.trim() || undefined,
        notes: undefined
      };
      
      const newClient = await addClientToSupabase(newClientData);
      console.log('DEBUG - Nuovo cliente creato:', newClient);
      return newClient;
    } catch (clientError) {
      console.error('DEBUG - Errore nella creazione del cliente:', clientError);
      throw new Error('Errore nella creazione del cliente');
    }
  };

  return {
    findExistingClient,
    createNewClient
  };
};
