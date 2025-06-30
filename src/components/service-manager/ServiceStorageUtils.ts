
import { ServiceCategory } from '@/types/appointment';
import { toast } from 'sonner';

export const loadStoredServices = (): Record<'Parrucchiere' | 'Estetista', ServiceCategory> => {
  try {
    const stored = localStorage.getItem('services');
    const backup1 = localStorage.getItem('services_backup');
    const backup2 = localStorage.getItem('customServices');
    
    console.log('DEBUG - ServiceCategoryManager loading services');
    
    let servicesToLoad = null;
    if (stored) {
      try {
        servicesToLoad = JSON.parse(stored);
      } catch (e) {
        console.error('Errore parsing servizi principali:', e);
      }
    }
    
    if (!servicesToLoad && backup1) {
      try {
        servicesToLoad = JSON.parse(backup1);
        console.log('ServiceCategoryManager usando backup1');
      } catch (e) {
        console.error('Errore parsing backup1:', e);
      }
    }
    
    if (!servicesToLoad && backup2) {
      try {
        servicesToLoad = JSON.parse(backup2);
        console.log('ServiceCategoryManager usando backup2');
      } catch (e) {
        console.error('Errore parsing backup2:', e);
      }
    }
    
    if (servicesToLoad && 
        servicesToLoad.Parrucchiere && servicesToLoad.Estetista && 
        Array.isArray(servicesToLoad.Parrucchiere.services) && 
        Array.isArray(servicesToLoad.Estetista.services)) {
      console.log('ServiceCategoryManager servizi recuperati:', servicesToLoad);
      return servicesToLoad;
    }
  } catch (error) {
    console.error('Errore nel parsing dei servizi:', error);
  }
  
  // Return expanded defaults
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
  console.log('ServiceCategoryManager usando servizi di default espansi:', defaultServices);
  return defaultServices;
};

export const saveServicesToStorage = (categories: Record<'Parrucchiere' | 'Estetista', ServiceCategory>) => {
  try {
    const dataToSave = JSON.stringify(categories);
    
    // Salva in multiple locations for backup
    localStorage.setItem('services', dataToSave);
    localStorage.setItem('services_backup', dataToSave);
    localStorage.setItem('customServices', dataToSave);
    localStorage.setItem('services_timestamp', new Date().toISOString());
    
    console.log('ServiceCategoryManager servizi salvati:', categories);
    
    // Emit custom event to notify other components
    window.dispatchEvent(new CustomEvent('servicesUpdated', { 
      detail: categories 
    }));
    
    // Also trigger storage event
    window.dispatchEvent(new Event('storage'));
    
  } catch (error) {
    console.error('Errore nel salvare i servizi:', error);
    toast.error('Errore nel salvare i servizi');
  }
};
