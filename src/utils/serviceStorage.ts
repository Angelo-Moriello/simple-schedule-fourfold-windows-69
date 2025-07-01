
import { saveServicesToSupabase, loadServicesFromSupabase, setupServiceRealtimeListener } from './supabaseServiceStorage';

// Global services state
let globalServices = null;
let realtimeChannel = null;

export const getStoredServices = async () => {
  try {
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
    const backup1 = localStorage.getItem('services_backup');
    const backup2 = localStorage.getItem('customServices');
    
    console.log('DEBUG - Caricamento servizi da localStorage:', {
      stored: stored ? 'presente' : 'assente',
      backup1: backup1 ? 'presente' : 'assente',
      backup2: backup2 ? 'presente' : 'assente'
    });
    
    let servicesToLoad = null;
    
    if (stored) {
      try {
        servicesToLoad = JSON.parse(stored);
        console.log('DEBUG - Servizi da stored:', servicesToLoad);
      } catch (e) {
        console.error('Errore parsing servizi principali:', e);
      }
    }
    
    if (!servicesToLoad && backup2) {
      try {
        servicesToLoad = JSON.parse(backup2);
        console.log('DEBUG - Servizi da customServices:', servicesToLoad);
      } catch (e) {
        console.error('Errore parsing customServices:', e);
      }
    }
    
    if (!servicesToLoad && backup1) {
      try {
        servicesToLoad = JSON.parse(backup1);
        console.log('DEBUG - Servizi da backup1:', servicesToLoad);
      } catch (e) {
        console.error('Errore parsing backup1:', e);
      }
    }
    
    if (servicesToLoad && servicesToLoad.Parrucchiere && servicesToLoad.Estetista && 
        Array.isArray(servicesToLoad.Parrucchiere.services) && 
        Array.isArray(servicesToLoad.Estetista.services)) {
      console.log('DEBUG - Servizi validi trovati:', servicesToLoad);
      globalServices = servicesToLoad;
      
      // Migra a Supabase se non ci sono già
      if (!supabaseServices) {
        await saveServicesToSupabase(servicesToLoad);
      }
      
      return servicesToLoad;
    }
    
    console.log('DEBUG - Nessun servizio valido trovato, creando defaults');
    const defaultServices = {
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
    
    await saveServicesToSupabase(defaultServices);
    saveServicesToLocalStorage(defaultServices);
    
    globalServices = defaultServices;
    console.log('DEBUG - Servizi default salvati:', defaultServices);
    return defaultServices;
  } catch (error) {
    console.error('Errore nel caricamento servizi:', error);
    const fallbackServices = {
      Parrucchiere: {
        name: 'Parrucchiere',
        services: ['Piega', 'Colore', 'Taglio', 'Colpi di sole', 'Trattamento Capelli']
      },
      Estetista: {
        name: 'Estetista',
        services: ['Pulizia Viso', 'Manicure', 'Pedicure', 'Massaggio', 'Depilazione', 'Trattamento Corpo']
      }
    };
    globalServices = fallbackServices;
    return fallbackServices;
  }
};

// Salva solo in localStorage
export const saveServicesToLocalStorage = (categories) => {
  try {
    const dataToSave = JSON.stringify(categories);
    localStorage.setItem('services', dataToSave);
    localStorage.setItem('services_backup', dataToSave);
    localStorage.setItem('customServices', dataToSave);
    localStorage.setItem('services_timestamp', new Date().toISOString());
    
    console.log('DEBUG - Servizi salvati in localStorage:', categories);
  } catch (error) {
    console.error('Errore nel salvare servizi in localStorage:', error);
  }
};

// Funzione unificata per salvare i servizi
export const saveServicesToStorage = async (categories) => {
  try {
    // Salva su Supabase
    const supabaseSuccess = await saveServicesToSupabase(categories);
    
    // Salva sempre in localStorage come backup
    saveServicesToLocalStorage(categories);
    
    console.log('DEBUG - Servizi salvati:', { supabaseSuccess, categories });
    
    // Clear cache
    globalServices = null;
    
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

// Function to refresh services - sempre ricarica da Supabase
export const refreshServices = async () => {
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
