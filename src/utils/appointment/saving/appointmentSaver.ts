
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { addAppointmentToSupabase } from '@/utils/supabase/appointmentMutations';

interface SaveResult {
  success: boolean;
  error?: string;
}

// Contatore globale per garantire unicità assoluta
let globalCounter = 0;

// Genera un UUID veramente unico con timestamp e contatore
const generateTrulyUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const counter = (++globalCounter).toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  
  // Formato UUID standard ma con parti uniche
  return `${timestamp.substr(0, 8)}-${counter.padStart(4, '0')}-4${randomPart.substr(0, 3)}-${randomPart.substr(3, 4)}-${randomPart.substr(7)}${timestamp.substr(8)}`.substr(0, 36);
};

export const saveAppointmentSafely = async (
  appointment: Appointment,
  addAppointment: (appointment: Appointment) => void
): Promise<SaveResult> => {
  try {
    // Genera un nuovo ID completamente unico per evitare conflitti
    const appointmentWithUniqueId = {
      ...appointment,
      id: generateTrulyUniqueId()
    };

    console.log('💾 Salvando appuntamento con ID veramente unico:', {
      client: appointmentWithUniqueId.client,
      date: appointmentWithUniqueId.date,
      time: appointmentWithUniqueId.time,
      id: appointmentWithUniqueId.id,
      originalId: appointment.id
    });

    // Salva su Supabase PRIMA
    await addAppointmentToSupabase(appointmentWithUniqueId);
    console.log('✅ Appuntamento salvato su Supabase:', appointmentWithUniqueId.id);
    
    // Solo se il salvataggio su Supabase è riuscito, aggiorna lo stato locale
    try {
      addAppointment(appointmentWithUniqueId);
      console.log('✅ Stato locale aggiornato con successo:', appointmentWithUniqueId.id);
    } catch (localError) {
      console.warn('⚠️ Errore aggiornamento stato locale (ma salvato su DB):', localError);
      // Non considerare questo un errore critico dato che il salvataggio su DB è riuscito
    }
    
    return { success: true };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('❌ Errore nel salvare appuntamento:', {
      appointmentId: appointment.id,
      client: appointment.client,
      error: errorMsg,
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

    // Pausa più lunga tra i salvataggi per evitare conflitti di timing
    if (i < appointments.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
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
