
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ServiceData {
  id?: string;
  user_id?: string;
  service_categories: Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }>;
  created_at?: string;
  updated_at?: string;
}

// Salva i servizi su Supabase
export const saveServicesToSupabase = async (categories: Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user authenticated, saving only to localStorage');
      return false;
    }

    // Controlla se esistono già servizi per questo utente
    const { data: existingServices, error: selectError } = await supabase
      .from('custom_services')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    const serviceData = {
      user_id: user.id,
      service_categories: categories,
      updated_at: new Date().toISOString()
    };

    if (existingServices) {
      // Aggiorna i servizi esistenti
      const { error } = await supabase
        .from('custom_services')
        .update(serviceData)
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Crea nuovi servizi
      const { error } = await supabase
        .from('custom_services')
        .insert({
          ...serviceData,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    console.log('Servizi salvati su Supabase:', categories);
    return true;
  } catch (error) {
    console.error('Errore nel salvare servizi su Supabase:', error);
    return false;
  }
};

// Carica i servizi da Supabase
export const loadServicesFromSupabase = async (): Promise<Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }> | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user authenticated, cannot load from Supabase');
      return null;
    }

    const { data: services, error } = await supabase
      .from('custom_services')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nessun record trovato, normale per nuovi utenti
        console.log('Nessun servizio personalizzato trovato per questo utente');
        return null;
      }
      throw error;
    }

    if (!services) {
      console.log('Nessun servizio trovato per questo utente');
      return null;
    }

    console.log('Servizi caricati da Supabase:', services.service_categories);
    return services.service_categories as Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }>;
  } catch (error) {
    console.error('Errore nel caricare servizi da Supabase:', error);
    return null;
  }
};

// Configura il listener per i cambiamenti in tempo reale
export const setupServiceRealtimeListener = (onServicesUpdated: (services: any) => void) => {
  const channel = supabase
    .channel('custom_services_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'custom_services'
      },
      (payload) => {
        console.log('Servizi aggiornati in tempo reale:', payload);
        if (payload.new && typeof payload.new === 'object' && 'service_categories' in payload.new) {
          onServicesUpdated(payload.new.service_categories);
        }
      }
    )
    .subscribe();

  return channel;
};

// Migra i servizi da localStorage a Supabase
export const migrateServicesFromLocalStorage = async () => {
  try {
    const localServices = localStorage.getItem('services');
    if (!localServices) return false;

    const services = JSON.parse(localServices);
    const success = await saveServicesToSupabase(services);
    
    if (success) {
      console.log('Servizi migrati da localStorage a Supabase');
      // Non rimuoviamo localStorage come backup
    }
    
    return success;
  } catch (error) {
    console.error('Errore nella migrazione servizi:', error);
    return false;
  }
};
