
import { saveServicesToSupabase, loadServicesFromSupabase, setupServiceRealtimeListener } from './supabaseServiceStorage';

// Default services that should always be available
const DEFAULT_SERVICES = {
  Parrucchiere: {
    name: 'Parrucchiere',
    services: [
      'Piega', 'Colore', 'Taglio', 'Colpi di sole', 'Trattamento Capelli',
      'Permanente', 'Stiratura', 'Extension', 'Balayage', 'Shatush',
      'Mèches', 'Decolorazione', 'Tinta', 'Riflessante'
    ]
  },
  Estetista: {
    name: 'Estetista',
    services: [
      'Pulizia Viso', 'Manicure', 'Pedicure', 'Massaggio', 'Depilazione', 'Trattamento Corpo',
      'Ricostruzione Unghie', 'Semipermanente', 'Trattamento Viso', 'Ceretta',
      'Peeling', 'Maschera Viso', 'Pressoterapia', 'Linfodrenaggio'
    ]
  }
};

// Global services state
let globalServices: Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }> | null = null;
let realtimeChannel: any = null;

export const getStoredServices = async (): Promise<Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }>> => {
  try {
    // Se abbiamo già i servizi in cache, restituiscili
    if (globalServices) {
      console.log('DEBUG - Servizi da cache:', globalServices);
      return globalServices;
    }

    // Prima prova a caricare da Supabase
    const supabaseServices = await loadServicesFromSupabase();
    
    if (supabaseServices) {
      console.log('DEBUG - Servizi caricati da Supabase:', supabaseServices);
      globalServices = supabaseServices;
      
      // Salva anche in localStorage come backup
      localStorage.setItem('services', JSON.stringify(supabaseServices));
      
      return supabaseServices;
    }

    // Se non ci sono servizi su Supabase, carica da localStorage
    const stored = localStorage.getItem('services');
    
    if (stored) {
      try {
        const parsedServices = JSON.parse(stored);
        if (parsedServices && parsedServices.Parrucchiere && parsedServices.Estetista) {
          console.log('DEBUG - Servizi da localStorage:', parsedServices);
          globalServices = parsedServices;
          return parsedServices;
        }
      } catch (e) {
        console.error('Errore parsing servizi da localStorage:', e);
      }
    }
    
    // Se non ci sono servizi personalizzati, usa quelli di default
    console.log('DEBUG - Usando servizi di default');
    globalServices = DEFAULT_SERVICES;
    
    // Salva i servizi di default
    await saveServicesToSupabase(DEFAULT_SERVICES);
    localStorage.setItem('services', JSON.stringify(DEFAULT_SERVICES));
    
    return DEFAULT_SERVICES;
  } catch (error) {
    console.error('Errore nel caricamento servizi:', error);
    // In caso di errore, restituisci sempre i servizi di default
    globalServices = DEFAULT_SERVICES;
    return DEFAULT_SERVICES;
  }
};

// Salva solo in localStorage
export const saveServicesToLocalStorage = (categories: Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }>) => {
  try {
    const dataToSave = JSON.stringify(categories);
    localStorage.setItem('services', dataToSave);
    localStorage.setItem('services_backup', dataToSave);
    localStorage.setItem('services_timestamp', new Date().toISOString());
    
    console.log('DEBUG - Servizi salvati in localStorage:', categories);
  } catch (error) {
    console.error('Errore nel salvare servizi in localStorage:', error);
  }
};

// Funzione unificata per salvare i servizi
export const saveServicesToStorage = async (categories: Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }>) => {
  try {
    // Salva su Supabase
    const supabaseSuccess = await saveServicesToSupabase(categories);
    
    // Salva sempre in localStorage come backup
    saveServicesToLocalStorage(categories);
    
    console.log('DEBUG - Servizi salvati:', { supabaseSuccess, categories });
    
    // Aggiorna cache globale
    globalServices = categories;
    
    // Emit custom event to notify other components
    window.dispatchEvent(new CustomEvent('servicesUpdated', { 
      detail: categories 
    }));
    
    return supabaseSuccess;
  } catch (error) {
    console.error('Errore nel salvare i servizi:', error);
    return false;
  }
};

// Function to refresh services - sempre ricarica
export const refreshServices = async (): Promise<Record<'Parrucchiere' | 'Estetista', { name: string; services: string[] }>> => {
  console.log('DEBUG - Refreshing services, clearing cache');
  globalServices = null;
  const services = await getStoredServices();
  
  // Emit event to notify components
  window.dispatchEvent(new CustomEvent('servicesUpdated', { 
    detail: services 
  }));
  
  return services;
};

// Function to setup realtime listener
export const setupServicesRealtimeListener = () => {
  if (realtimeChannel) {
    return realtimeChannel;
  }

  realtimeChannel = setupServiceRealtimeListener((updatedServices) => {
    console.log('DEBUG - Servizi aggiornati via realtime:', updatedServices);
    globalServices = updatedServices;
    
    // Salva in localStorage come backup
    saveServicesToLocalStorage(updatedServices);
    
    // Notify components
    window.dispatchEvent(new CustomEvent('servicesUpdated', { 
      detail: updatedServices 
    }));
  });

  return realtimeChannel;
};

// Function to clear cache and force reload
export const clearServicesCache = () => {
  console.log('DEBUG - Clearing services cache');
  globalServices = null;
};
