
import { ServiceCategories, DEFAULT_SERVICES } from './types';
import { getServicesCache, setServicesCache, clearServicesCache, getRealtimeChannel, setRealtimeChannel } from './cache';
import { saveServicesToLocalStorage, loadServicesFromLocalStorage } from './localStorage';
import { emitServicesUpdatedEvent } from './events';
import { saveServicesToSupabase, loadServicesFromSupabase, setupServiceRealtimeListener } from '../supabaseServiceStorage';

export const getStoredServices = async (): Promise<ServiceCategories> => {
  try {
    // Se abbiamo già i servizi in cache, restituiscili
    const cachedServices = getServicesCache();
    if (cachedServices) {
      console.log('DEBUG - Servizi da cache:', cachedServices);
      return cachedServices;
    }

    // Prima prova a caricare da Supabase
    const supabaseServices = await loadServicesFromSupabase();
    
    if (supabaseServices) {
      console.log('DEBUG - Servizi caricati da Supabase:', supabaseServices);
      setServicesCache(supabaseServices);
      
      // Salva anche in localStorage come backup
      saveServicesToLocalStorage(supabaseServices);
      
      return supabaseServices;
    }

    // Se non ci sono servizi su Supabase, carica da localStorage
    const localServices = loadServicesFromLocalStorage();
    
    if (localServices) {
      console.log('DEBUG - Servizi da localStorage:', localServices);
      setServicesCache(localServices);
      return localServices;
    }
    
    // Se non ci sono servizi personalizzati, usa quelli di default
    console.log('DEBUG - Usando servizi di default');
    setServicesCache(DEFAULT_SERVICES);
    
    // Salva i servizi di default
    await saveServicesToSupabase(DEFAULT_SERVICES);
    saveServicesToLocalStorage(DEFAULT_SERVICES);
    
    return DEFAULT_SERVICES;
  } catch (error) {
    console.error('Errore nel caricamento servizi:', error);
    // In caso di errore, restituisci sempre i servizi di default
    setServicesCache(DEFAULT_SERVICES);
    return DEFAULT_SERVICES;
  }
};

export const saveServicesToStorage = async (categories: ServiceCategories): Promise<boolean> => {
  try {
    // Salva su Supabase
    const supabaseSuccess = await saveServicesToSupabase(categories);
    
    // Salva sempre in localStorage come backup
    saveServicesToLocalStorage(categories);
    
    console.log('DEBUG - Servizi salvati:', { supabaseSuccess, categories });
    
    // Aggiorna cache globale
    setServicesCache(categories);
    
    // Emit custom event to notify other components
    emitServicesUpdatedEvent(categories);
    
    return supabaseSuccess;
  } catch (error) {
    console.error('Errore nel salvare i servizi:', error);
    return false;
  }
};

export const refreshServices = async (): Promise<ServiceCategories> => {
  console.log('DEBUG - Refreshing services, clearing cache');
  clearServicesCache();
  const services = await getStoredServices();
  
  // Emit event to notify components
  emitServicesUpdatedEvent(services);
  
  return services;
};

export const setupServicesRealtimeListener = () => {
  const existingChannel = getRealtimeChannel();
  if (existingChannel) {
    return existingChannel;
  }

  const channel = setupServiceRealtimeListener((updatedServices) => {
    console.log('DEBUG - Servizi aggiornati via realtime:', updatedServices);
    setServicesCache(updatedServices);
    
    // Salva in localStorage come backup
    saveServicesToLocalStorage(updatedServices);
    
    // Notify components
    emitServicesUpdatedEvent(updatedServices);
  });

  setRealtimeChannel(channel);
  return channel;
};
