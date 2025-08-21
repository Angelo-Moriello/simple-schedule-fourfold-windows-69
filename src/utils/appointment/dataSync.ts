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
const SYNC_INTERVAL = 5000; // 5 secondi

// Gestisce la sincronizzazione intelligente dei dati
export const syncAppointmentsData = async (
  forceRefresh = false
): Promise<DataSyncResult> => {
  try {
    const now = Date.now();
    
    // Se non è passato abbastanza tempo e non è forzato, restituisci la cache
    if (!forceRefresh && (now - lastSyncTime) < SYNC_INTERVAL && appointmentsCache.length > 0) {
      console.log('📋 Usando cache appuntamenti (sincronizzazione recente)');
      return { success: true, data: [...appointmentsCache] };
    }

    console.log('🔄 Sincronizzazione appuntamenti dal database...');
    const freshData = await loadAppointmentsFromSupabase();
    
    // Aggiorna la cache
    appointmentsCache = freshData;
    lastSyncTime = now;
    
    console.log('✅ Sincronizzazione completata:', {
      totalAppointments: freshData.length,
      cacheUpdated: true
    });
    
    return { success: true, data: [...freshData] };
  } catch (error) {
    console.error('❌ Errore nella sincronizzazione:', error);
    
    // In caso di errore, restituisci la cache se disponibile
    if (appointmentsCache.length > 0) {
      console.log('⚠️ Usando cache come fallback dopo errore');
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

// Valida la consistenza dei dati
export const validateDataConsistency = (appointments: Appointment[]): boolean => {
  // Controlla duplicati per ID
  const ids = appointments.map(apt => apt.id);
  const uniqueIds = new Set(ids);
  
  if (ids.length !== uniqueIds.size) {
    console.warn('⚠️ Rilevati appuntamenti duplicati per ID');
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