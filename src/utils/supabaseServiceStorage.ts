
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ServiceData {
  id?: string;
  service_categories: Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }>;
  created_at?: string;
  updated_at?: string;
}

// Salva i servizi su Supabase (ora globali per tutti gli utenti)
export const saveServicesToSupabase = async (categories: Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user authenticated, saving only to localStorage');
      return false;
    }

    // Controlla se esistono già servizi globali
    const { data: existingServices, error: selectError } = await supabase
      .from('custom_services')
      .select('*')
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    const serviceData = {
      service_categories: categories,
      updated_at: new Date().toISOString()
    };

    if (existingServices) {
      // Aggiorna i servizi esistenti
      const { error } = await supabase
        .from('custom_services')
        .update(serviceData)
        .eq('id', existingServices.id);

      if (error) throw error;
    } else {
      // Crea nuovi servizi globali
      const { error } = await supabase
        .from('custom_services')
        .insert({
          ...serviceData,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    console.log('Servizi globali salvati su Supabase:', categories);
    return true;
  } catch (error) {
    console.error('Errore nel salvare servizi globali su Supabase:', error);
    return false;
  }
};

// Carica i servizi globali da Supabase
export const loadServicesFromSupabase = async (): Promise<Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }> | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user authenticated, cannot load from Supabase');
      return null;
    }

    // Carica i servizi globali (non più filtrati per utente)
    const { data: services, error } = await supabase
      .from('custom_services')
      .select('*')
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nessun record trovato, normale per prima volta
        console.log('Nessun servizio globale trovato');
        return null;
      }
      throw error;
    }

    if (!services) {
      console.log('Nessun servizio globale trovato');
      return null;
    }

    console.log('Servizi globali caricati da Supabase:', services.service_categories);
    return services.service_categories as Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }>;
  } catch (error) {
    console.error('Errore nel caricare servizi globali da Supabase:', error);
    return null;
  }
};

// Configura il listener per i cambiamenti in tempo reale dei servizi globali
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
        console.log('Servizi globali aggiornati in tempo reale:', payload);
        if (payload.new && typeof payload.new === 'object' && 'service_categories' in payload.new) {
          onServicesUpdated(payload.new.service_categories);
        }
      }
    )
    .subscribe();

  return channel;
};

// Migra i servizi da localStorage a Supabase come servizi globali
export const migrateServicesFromLocalStorage = async () => {
  try {
    const localServices = localStorage.getItem('services');
    if (!localServices) return false;

    const services = JSON.parse(localServices);
    const success = await saveServicesToSupabase(services);
    
    if (success) {
      console.log('Servizi migrati da localStorage a Supabase come servizi globali');
      // Non rimuoviamo localStorage come backup
    }
    
    return success;
  } catch (error) {
    console.error('Errore nella migrazione servizi globali:', error);
    return false;
  }
};
