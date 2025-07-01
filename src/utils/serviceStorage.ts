
// Global services state
let globalServices = null;

export const getStoredServices = () => {
  try {
    // Prova a recuperare da multiple sources
    const stored = localStorage.getItem('services');
    const backup1 = localStorage.getItem('services_backup');
    const backup2 = localStorage.getItem('customServices');
    
    console.log('DEBUG - Caricamento servizi da localStorage:', {
      stored: stored ? 'presente' : 'assente',
      backup1: backup1 ? 'presente' : 'assente',
      backup2: backup2 ? 'presente' : 'assente'
    });
    
    let servicesToLoad = null;
    
    // Prova prima 'services', poi 'customServices', poi 'services_backup'
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
      return servicesToLoad;
    }
    
    console.log('DEBUG - Nessun servizio valido trovato, creando defaults espansi');
    const defaultServices = {
      Parrucchiere: {
        name: 'Parrucchiere',
        services: [
          'Piega', 
          'Colore', 
          'Taglio', 
          'Colpi di sole', 
          'Trattamento Capelli',
          'Permanente',
          'Stiratura',
          'Extension',
          'Balayage',
          'Shatush',
          'Mèches',
          'Decolorazione',
          'Tinta',
          'Riflessante'
        ]
      },
      Estetista: {
        name: 'Estetista',
        services: [
          'Pulizia Viso', 
          'Manicure', 
          'Pedicure', 
          'Massaggio', 
          'Depilazione', 
          'Trattamento Corpo',
          'Ricostruzione Unghie',
          'Semipermanente',
          'Trattamento Viso',
          'Ceretta',
          'Peeling',
          'Maschera Viso',
          'Pressoterapia',
          'Linfodrenaggio'
        ]
      }
    };
    
    // Salva i defaults espansi
    saveServicesToStorage(defaultServices);
    
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

// Funzione unificata per salvare i servizi
export const saveServicesToStorage = (categories) => {
  try {
    const dataToSave = JSON.stringify(categories);
    
    // Salva in multiple locations for backup
    localStorage.setItem('services', dataToSave);
    localStorage.setItem('services_backup', dataToSave);
    localStorage.setItem('customServices', dataToSave);
    localStorage.setItem('services_timestamp', new Date().toISOString());
    
    console.log('DEBUG - Servizi salvati in tutte le chiavi:', categories);
    
    // Clear cache
    globalServices = null;
    
    // Emit custom event to notify other components
    window.dispatchEvent(new CustomEvent('servicesUpdated', { 
      detail: categories 
    }));
    
    // Also trigger storage event manually
    window.dispatchEvent(new Event('storage'));
    
    // Force page refresh for cross-tab synchronization
    setTimeout(() => {
      const event = new StorageEvent('storage', {
        key: 'services',
        newValue: dataToSave,
        url: window.location.href
      });
      window.dispatchEvent(event);
    }, 100);
    
  } catch (error) {
    console.error('Errore nel salvare i servizi:', error);
  }
};

// Function to refresh services from localStorage - sempre ricarica
export const refreshServices = () => {
  console.log('DEBUG - Refreshing services from localStorage, clearing cache');
  globalServices = null;
  const services = getStoredServices();
  
  // Emit event to notify components
  window.dispatchEvent(new CustomEvent('servicesUpdated', { 
    detail: services 
  }));
  
  return services;
};

// Function to clear cache and force reload
export const clearServicesCache = () => {
  console.log('DEBUG - Clearing services cache');
  globalServices = null;
};
