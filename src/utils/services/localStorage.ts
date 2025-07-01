
import { ServiceCategories } from './types';

export const saveServicesToLocalStorage = (categories: ServiceCategories): void => {
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

export const loadServicesFromLocalStorage = (): ServiceCategories | null => {
  try {
    const stored = localStorage.getItem('services');
    
    if (stored) {
      const parsedServices = JSON.parse(stored);
      if (parsedServices && parsedServices.Parrucchiere && parsedServices.Estetista) {
        console.log('DEBUG - Servizi da localStorage:', parsedServices);
        return parsedServices;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Errore parsing servizi da localStorage:', error);
    return null;
  }
};
