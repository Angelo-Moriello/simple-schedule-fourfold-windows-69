
// Global services state
let globalServices = null;

export const getStoredServices = () => {
  if (globalServices) {
    console.log('DEBUG - Usando servizi globali cached:', globalServices);
    return globalServices;
  }

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
    if (stored) {
      try {
        servicesToLoad = JSON.parse(stored);
        console.log('DEBUG - Servizi da stored:', servicesToLoad);
      } catch (e) {
        console.error('Errore parsing servizi principali:', e);
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
    
    if (!servicesToLoad && backup2) {
      try {
        servicesToLoad = JSON.parse(backup2);
        console.log('DEBUG - Servizi da backup2:', servicesToLoad);
      } catch (e) {
        console.error('Errore parsing backup2:', e);
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
    const dataToSave = JSON.stringify(defaultServices);
    localStorage.setItem('services', dataToSave);
    localStorage.setItem('services_backup', dataToSave);
    localStorage.setItem('customServices', dataToSave);
    
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

// Function to refresh services from localStorage
export const refreshServices = () => {
  console.log('DEBUG - Refreshing services from localStorage');
  globalServices = null;
  return getStoredServices();
};
