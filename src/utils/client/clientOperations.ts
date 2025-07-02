
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';

export const loadClientsFromSupabase = async (): Promise<Client[]> => {
  try {
    console.log('DEBUG - Caricamento clienti da Supabase...');
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('DEBUG - Errore nel caricamento clienti:', error);
      throw error;
    }
    
    console.log('DEBUG - Clienti caricati da DB:', data?.length || 0, data);
    
    // Convert Supabase data to Client interface
    const clients: Client[] = (data || []).map(row => ({
      id: row.id,
      name: row.name,
      email: row.email || undefined,
      phone: row.phone || undefined,
      notes: row.notes || undefined,
      created_at: row.created_at || undefined,
      updated_at: row.updated_at || undefined
    }));
    
    return clients;
  } catch (error) {
    console.error('DEBUG - Errore nel caricare i clienti da Supabase:', error);
    return [];
  }
};

export const addClientToSupabase = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
  try {
    console.log('DEBUG - Aggiunta cliente a Supabase:', client);
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
      
    if (error) {
      console.error('DEBUG - Errore nell\'aggiunta cliente:', error);
      throw error;
    }
    
    console.log('DEBUG - Cliente aggiunto con successo:', data);
    
    // Convert Supabase data to Client interface
    const newClient: Client = {
      id: data.id,
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      notes: data.notes || undefined,
      created_at: data.created_at || undefined,
      updated_at: data.updated_at || undefined
    };
    
    return newClient;
  } catch (error) {
    console.error('DEBUG - Errore nell\'aggiungere cliente su Supabase:', error);
    throw error;
  }
};

export const updateClientInSupabase = async (client: Client): Promise<void> => {
  try {
    console.log('Aggiornamento cliente su Supabase:', client);
    const { error } = await supabase
      .from('clients')
      .update({
        name: client.name,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', client.id);
      
    if (error) {
      console.error('Errore nell\'aggiornamento cliente:', error);
      throw error;
    }
    
    console.log('Cliente aggiornato con successo');
  } catch (error) {
    console.error('Errore nell\'aggiornare cliente su Supabase:', error);
    throw error;
  }
};

export const deleteClientFromSupabase = async (clientId: string): Promise<void> => {
  try {
    console.log('Eliminazione cliente da Supabase:', clientId);
    
    // Prima elimina tutti gli appuntamenti collegati al cliente
    console.log('Eliminazione appuntamenti collegati al cliente...');
    const { error: appointmentsError } = await supabase
      .from('appointments')
      .delete()
      .eq('client_id', clientId);
      
    if (appointmentsError) {
      console.error('Errore nell\'eliminazione appuntamenti:', appointmentsError);
      throw new Error('Errore nell\'eliminazione degli appuntamenti collegati: ' + appointmentsError.message);
    }
    
    // Poi elimina tutti i trattamenti ricorrenti collegati al cliente
    console.log('Eliminazione trattamenti ricorrenti collegati al cliente...');
    const { error: treatmentsError } = await supabase
      .from('recurring_treatments')
      .delete()
      .eq('client_id', clientId);
      
    if (treatmentsError) {
      console.error('Errore nell\'eliminazione trattamenti ricorrenti:', treatmentsError);
      throw new Error('Errore nell\'eliminazione dei trattamenti ricorrenti: ' + treatmentsError.message);
    }
    
    // Infine elimina il cliente
    console.log('Eliminazione cliente...');
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);
      
    if (error) {
      console.error('Errore nell\'eliminazione cliente:', error);
      throw error;
    }
    
    console.log('Cliente e dati collegati eliminati con successo');
  } catch (error) {
    console.error('Errore nell\'eliminare cliente da Supabase:', error);
    throw error;
  }
};
