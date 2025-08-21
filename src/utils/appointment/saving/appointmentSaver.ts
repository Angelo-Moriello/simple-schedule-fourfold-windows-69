
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { addAppointmentToSupabase } from '@/utils/supabase/appointmentMutations';
import { supabase } from '@/integrations/supabase/client';

interface SaveResult {
  success: boolean;
  error?: string;
}

// Set per tenere traccia degli ID generati in questa sessione
const generatedIds = new Set<string>();

// Genera un UUID v4 standard
const generateStandardUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Controlla se un ID esiste già nel database
const checkIdExists = async (id: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = nessun risultato trovato
      console.warn('Errore nel controllare ID esistente:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.warn('Errore nel controllo ID:', error);
    return false;
  }
};

// Genera un ID unico garantito, controllando anche il set locale
const generateUniqueId = async (maxRetries = 10): Promise<string> => {
  for (let i = 0; i < maxRetries; i++) {
    const id = generateStandardUUID();
    
    // Controlla prima nel set locale (più veloce)
    if (generatedIds.has(id)) {
      console.warn(`⚠️ ID duplicato nel set locale al tentativo ${i + 1}, rigenerando...`);
      continue;
    }
    
    // Poi controlla nel database
    const exists = await checkIdExists(id);
    
    if (!exists) {
      console.log(`✅ ID unico generato al tentativo ${i + 1}:`, id);
      generatedIds.add(id); // Aggiungi al set locale
      return id;
    }
    
    console.warn(`⚠️ ID duplicato rilevato nel DB al tentativo ${i + 1}, rigenerando...`);
  }
  
  // Fallback con timestamp e random per garantire unicità assoluta
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const fallbackId = `${generateStandardUUID()}-${timestamp}-${random}`;
  console.log('🔄 Usando ID fallback con timestamp e random:', fallbackId);
  generatedIds.add(fallbackId);
  return fallbackId;
};

// Pulisce il set degli ID generati (chiamato all'inizio di un nuovo salvataggio)
export const clearGeneratedIdsCache = () => {
  generatedIds.clear();
  console.log('🧹 Cache degli ID generati pulita');
};

export const saveAppointmentSafely = async (
  appointment: Appointment,
  addAppointment: (appointment: Appointment) => void
): Promise<SaveResult> => {
  try {
    // Usa l'ID esistente dell'appuntamento invece di generarne uno nuovo
    const appointmentToSave = { ...appointment };

    console.log('💾 Salvando appuntamento:', {
      client: appointmentToSave.client,
      date: appointmentToSave.date,
      time: appointmentToSave.time,
      id: appointmentToSave.id
    });

    // Salva su Supabase PRIMA
    await addAppointmentToSupabase(appointmentToSave);
    console.log('✅ Appuntamento salvato su Supabase:', appointmentToSave.id);
    
    // Solo se il salvataggio su Supabase è riuscito, aggiorna lo stato locale
    try {
      addAppointment(appointmentToSave);
      console.log('✅ Stato locale aggiornato con successo:', appointmentToSave.id);
    } catch (localError) {
      console.warn('⚠️ Errore aggiornamento stato locale (ma salvato su DB):', localError);
      // Non considerare questo un errore critico dato che il salvataggio su DB è riuscito
    }
    
    return { success: true };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('❌ Errore dettagliato nel salvare appuntamento:', {
      appointmentId: appointment.id,
      client: appointment.client,
      error: error,
      errorMessage: errorMsg,
      errorStack: error instanceof Error ? error.stack : undefined,
      fullError: error
    });
    
    return { success: false, error: errorMsg };
  }
};

export const saveMultipleAppointments = async (
  appointments: Appointment[],
  addAppointment: (appointment: Appointment) => void,
  onProgress?: (saved: number, total: number) => void
): Promise<{ savedCount: number; failedSaves: string[] }> => {
  const failedSaves: string[] = [];
  let savedCount = 0;

  console.log('🚀 Inizio salvataggio multiplo:', {
    totalAppointments: appointments.length,
    appointments: appointments.map(a => ({ client: a.client, date: a.date, time: a.time, originalId: a.id }))
  });

  // Pulisce la cache degli ID prima di iniziare un nuovo batch di salvataggi
  clearGeneratedIdsCache();

  for (let i = 0; i < appointments.length; i++) {
    const appointment = appointments[i];
    
    console.log(`📝 Salvando appuntamento ${i + 1}/${appointments.length}:`, {
      client: appointment.client,
      date: appointment.date,
      time: appointment.time,
      originalId: appointment.id
    });

    const result = await saveAppointmentSafely(appointment, addAppointment);
    
    if (result.success) {
      savedCount++;
      console.log(`✅ Salvato ${savedCount}/${appointments.length}`);
    } else {
      const errorDescription = `${appointment.date} ${appointment.time} - ${appointment.client}: ${result.error}`;
      failedSaves.push(errorDescription);
      console.error(`❌ Fallito salvataggio:`, errorDescription);
    }

    // Notifica progresso
    if (onProgress) {
      onProgress(savedCount, appointments.length);
    }

    // Pausa più lunga tra i salvataggi per evitare conflitti
    if (i < appointments.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  console.log('🏁 Salvataggio multiplo completato:', {
    salvati: savedCount,
    totale: appointments.length,
    falliti: failedSaves.length,
    successRate: `${Math.round((savedCount / appointments.length) * 100)}%`
  });

  return { savedCount, failedSaves };
};
