
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { addAppointmentToSupabase } from '@/utils/supabase/appointmentMutations';

interface SaveResult {
  success: boolean;
  error?: string;
}

// Genera un UUID unico per ogni chiamata
const generateUniqueId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const saveAppointmentSafely = async (
  appointment: Appointment,
  addAppointment: (appointment: Appointment) => void
): Promise<SaveResult> => {
  try {
    // Genera un nuovo ID unico per ogni appuntamento per evitare conflitti
    const appointmentWithUniqueId = {
      ...appointment,
      id: generateUniqueId()
    };

    console.log('💾 Salvando appuntamento con ID unico:', {
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

    // Pausa breve tra i salvataggi per evitare sovraccarico
    if (i < appointments.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 150));
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
