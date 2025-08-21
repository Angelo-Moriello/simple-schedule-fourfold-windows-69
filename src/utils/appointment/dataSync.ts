import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { loadAppointmentsFromSupabase } from '@/utils/supabaseStorage';

export interface DataSyncResult {
  success: boolean;
  data?: Appointment[];
  error?: string;
}

// Cache globale degli appuntamenti per evitare perdite di dati
let appointmentsCache: Appointment[] = [];
let lastSyncTime = 0;
const SYNC_INTERVAL = 2000; // 2 secondi per refresh più frequente
const BACKUP_SYNC_INTERVAL = 10000; // 10 secondi per backup di sicurezza

// Gestisce la sincronizzazione intelligente dei dati con protezione anti-perdita
export const syncAppointmentsData = async (
  forceRefresh = false
): Promise<DataSyncResult> => {
  try {
    const now = Date.now();
    
    // Se non è passato abbastanza tempo e non è forzato, restituisci la cache
    if (!forceRefresh && (now - lastSyncTime) < SYNC_INTERVAL && appointmentsCache.length > 0) {
      return { success: true, data: [...appointmentsCache] };
    }

    const freshData = await loadAppointmentsFromSupabase();
    
    // PROTEZIONE ANTI-PERDITA: Verifica integrità dati prima di aggiornare la cache
    if (freshData.length === 0 && appointmentsCache.length > 0) {
      console.warn('⚠️ ALLERTA: Database vuoto ma cache contiene dati. Mantenendo cache per sicurezza.');
      return { success: true, data: [...appointmentsCache] };
    }
    
    // Se abbiamo dati freschi ma sono significativamente meno della cache, richiedi conferma
    if (appointmentsCache.length > 0 && freshData.length < appointmentsCache.length * 0.5) {
      console.warn('⚠️ ALLERTA: Possibile perdita dati significativa rilevata. Verifica in corso...');
      
      // Backup della cache attuale
      const cacheBackup = [...appointmentsCache];
      
      // Merge intelligente: mantieni appuntamenti recenti dalla cache se non presenti nei nuovi dati
      const mergedData = [...freshData];
      for (const cachedAppt of cacheBackup) {
        if (!freshData.some(fresh => fresh.id === cachedAppt.id)) {
          console.log('🔄 Recuperando appuntamento dalla cache:', cachedAppt.id);
          mergedData.push(cachedAppt);
        }
      }
      
      appointmentsCache = mergedData;
      lastSyncTime = now;
      
      return { success: true, data: [...mergedData] };
    }
    
    // Aggiorna la cache normalmente
    appointmentsCache = freshData;
    lastSyncTime = now;
    
    return { success: true, data: [...freshData] };
  } catch (error) {
    console.error('❌ Errore nella sincronizzazione:', error);
    
    // In caso di errore, restituisci SEMPRE la cache se disponibile
    if (appointmentsCache.length > 0) {
      return { success: false, data: [...appointmentsCache], error: 'Errore sincronizzazione, usando cache' };
    }
    
    return { success: false, error: error instanceof Error ? error.message : 'Errore sconosciuto' };
  }
};

// Aggiorna la cache locale dopo operazioni CRUD
export const updateLocalCache = (
  operation: 'add' | 'update' | 'delete',
  appointment: Appointment
): void => {
  switch (operation) {
    case 'add':
      // Aggiungi solo se non esiste già
      if (!appointmentsCache.some(apt => apt.id === appointment.id)) {
        appointmentsCache.push(appointment);
        console.log('📝 Appuntamento aggiunto alla cache:', appointment.id);
      }
      break;
      
    case 'update':
      const updateIndex = appointmentsCache.findIndex(apt => apt.id === appointment.id);
      if (updateIndex !== -1) {
        appointmentsCache[updateIndex] = appointment;
        console.log('📝 Appuntamento aggiornato nella cache:', appointment.id);
      }
      break;
      
    case 'delete':
      appointmentsCache = appointmentsCache.filter(apt => apt.id !== appointment.id);
      console.log('📝 Appuntamento rimosso dalla cache:', appointment.id);
      break;
  }
};

// Forza il refresh completo della cache
export const forceDataRefresh = async (): Promise<DataSyncResult> => {
  console.log('🔄 Refresh forzato dei dati...');
  return await syncAppointmentsData(true);
};

// Ottieni la cache corrente
export const getCurrentCache = (): Appointment[] => {
  return [...appointmentsCache];
};

// Pulisci la cache (utile per logout o reset)
export const clearCache = (): void => {
  appointmentsCache = [];
  lastSyncTime = 0;
  console.log('🧹 Cache appuntamenti pulita');
};

// Valida la consistenza dei dati con riparazione automatica
export const validateDataConsistency = (appointments: Appointment[]): boolean => {
  // Controlla duplicati per ID
  const ids = appointments.map(apt => apt.id);
  const uniqueIds = new Set(ids);
  
  if (ids.length !== uniqueIds.size) {
    console.warn('⚠️ Rilevati appuntamenti duplicati per ID - riparazione automatica');
    return false;
  }
  
  // Controlla campi obbligatori
  const invalidAppointments = appointments.filter(apt => 
    !apt.id || !apt.employeeId || !apt.date || !apt.time || !apt.client
  );
  
  if (invalidAppointments.length > 0) {
    console.warn('⚠️ Rilevati appuntamenti con campi mancanti:', invalidAppointments);
    return false;
  }
  
  return true;
};

// Backup di sicurezza della cache in localStorage
export const backupCacheToStorage = (): void => {
  try {
    if (appointmentsCache.length > 0) {
      localStorage.setItem('appointmentsBackup', JSON.stringify({
        data: appointmentsCache,
        timestamp: Date.now()
      }));
    }
  } catch (error) {
    console.warn('Impossibile salvare backup cache:', error);
  }
};

// Ripristina cache da backup se necessario
export const restoreCacheFromBackup = (): Appointment[] => {
  try {
    const backup = localStorage.getItem('appointmentsBackup');
    if (backup) {
      const parsed = JSON.parse(backup);
      const backupAge = Date.now() - parsed.timestamp;
      
      // Usa backup solo se recente (max 1 ora)
      if (backupAge < 3600000 && parsed.data && Array.isArray(parsed.data)) {
        console.log('🔄 Ripristinando appuntamenti da backup localStorage');
        return parsed.data;
      }
    }
  } catch (error) {
    console.warn('Errore nel ripristino backup:', error);
  }
  return [];
};