import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types/appointment';
import { generateUUID, findClientIdByName } from './appointmentHelpers';

// Valida che una stringa sia un UUID v1-v5
const isValidUUID = (value: string | null | undefined): boolean => {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};
export const saveAppointmentsToSupabase = async (appointments: Appointment[]) => {
  try {
    console.log('Salvataggio appuntamenti su Supabase:', appointments);
    
    const { error: deleteError } = await supabase.from('appointments').delete().gt('created_at', '2000-01-01');
    if (deleteError) {
      console.error('Errore nella cancellazione appuntamenti esistenti:', deleteError);
      throw deleteError;
    }
    
    if (appointments.length > 0) {
      const appointmentsToInsert = await Promise.all(appointments.map(async (app) => {
        let clientId = app.clientId;
        if (!clientId && app.client) {
          clientId = await findClientIdByName(app.client);
        }
        
        return {
          id: isValidUUID(app.id) ? app.id : generateUUID(),
          employee_id: app.employeeId,
          date: app.date,
          time: app.time,
          title: app.title,
          client: app.client,
          duration: app.duration,
          notes: app.notes,
          email: app.email,
          phone: app.phone,
          color: app.color,
          service_type: app.serviceType,
          client_id: isValidUUID(clientId) ? clientId : null
        };
      }));
      
      console.log('Appuntamenti con UUID e client_id corretti:', appointmentsToInsert);
      
      const { error: insertError } = await supabase.from('appointments').insert(appointmentsToInsert);
      if (insertError) {
        console.error('Errore nell\'inserimento appuntamenti:', insertError);
        throw insertError;
      }
    }
    console.log('Appuntamenti salvati con successo');
  } catch (error) {
    console.error('Errore nel salvare gli appuntamenti su Supabase:', error);
    throw error;
  }
};

export const addAppointmentToSupabase = async (appointment: Appointment) => {
  try {
    console.log('🔍 DEBUG - Inizio aggiunta appuntamento a Supabase:', {
      appointmentId: appointment.id,
      client: appointment.client,
      date: appointment.date,
      time: appointment.time,
      employeeId: appointment.employeeId
    });
    
    // Se l'ID non è un UUID valido, NON lo inviamo: lasciamo che Postgres generi gen_random_uuid()
    const useProvidedId = isValidUUID(appointment.id);
    console.log('🔍 DEBUG - ID valido?', useProvidedId, 'ID:', appointment.id);
    
    let clientId = appointment.clientId;
    if (!clientId && appointment.client) {
      console.log('🔍 DEBUG - Cercando client ID per nome:', appointment.client);
      clientId = await findClientIdByName(appointment.client);
      console.log('🔍 DEBUG - Client ID trovato:', clientId);
    }
    
    const baseData: any = {
      employee_id: appointment.employeeId,
      date: appointment.date,
      time: appointment.time,
      title: appointment.title || '',
      client: appointment.client,
      duration: appointment.duration,
      notes: appointment.notes || '',
      email: appointment.email || '',
      phone: appointment.phone || '',
      color: appointment.color,
      service_type: appointment.serviceType,
      client_id: isValidUUID(clientId) ? clientId : null
    };

    // Funzione helper per tentare l'inserimento con o senza ID
    const tryInsert = async (withId: boolean) => {
      const dataToInsert = { ...baseData } as any;
      if (withId && useProvidedId) {
        dataToInsert.id = appointment.id;
      } else {
        // assicuriamoci che l'ID non venga inviato
        delete dataToInsert.id;
      }
      console.log('🔍 DEBUG - Tentativo insert (withId =', withId, '):', dataToInsert);
      const { data, error, status } = await supabase
        .from('appointments')
        .insert(dataToInsert)
        .select('id')
        .single();
      return { data, error, status };
    };

    // Primo tentativo: solo se l'ID fornito è valido, altrimenti direttamente senza ID
    let attemptWithId = useProvidedId;
    let { data, error, status } = await tryInsert(attemptWithId);

    // Se c'è conflitto di chiave (409/Postgres 23505), ritenta senza ID per generarlo lato DB
    const isDuplicateKey = (e: any, s?: number) => {
      return (
        e?.code === '23505' ||
        s === 409 ||
        (typeof e?.message === 'string' && e.message.toLowerCase().includes('duplicate key'))
      );
    };

    if (error && attemptWithId && isDuplicateKey(error, status)) {
      console.warn('⚠️ Conflitto ID rilevato. Nuovo tentativo senza ID...');
      ({ data, error, status } = await tryInsert(false));
    }

    if (error) {
      console.error('❌ Errore SQL dettagliato nell\'aggiunta appuntamento:', {
        error,
        code: (error as any)?.code,
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        appointment,
        baseData
      });
      throw error;
    }

    const finalId = data?.id as string;
    console.log('✅ Appuntamento aggiunto con successo', { id: finalId });
    return finalId;
  } catch (error) {
    console.error('❌ Errore completo nell\'aggiungere appuntamento su Supabase:', {
      error: error,
      appointment: appointment,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

export const updateAppointmentInSupabase = async (appointment: Appointment) => {
  try {
    console.log('Aggiornamento appuntamento su Supabase:', appointment);
    
    let clientId = appointment.clientId;
    if (!clientId && appointment.client) {
      clientId = await findClientIdByName(appointment.client);
    }
    
    const { error } = await supabase
      .from('appointments')
      .update({
        employee_id: appointment.employeeId,
        date: appointment.date,
        time: appointment.time,
        title: appointment.title || '',
        client: appointment.client,
        duration: appointment.duration,
        notes: appointment.notes || '',
        email: appointment.email || '',
        phone: appointment.phone || '',
        color: appointment.color,
        service_type: appointment.serviceType,
        client_id: isValidUUID(clientId) ? clientId : null
      })
      .eq('id', appointment.id);
    if (error) {
      console.error('Errore SQL nell\'aggiornamento appuntamento:', error);
      throw error;
    }
    console.log('Appuntamento aggiornato con successo');
  } catch (error) {
    console.error('Errore nell\'aggiornare appuntamento su Supabase:', error);
    throw error;
  }
};

export const deleteAppointmentFromSupabase = async (appointmentId: string) => {
  try {
    console.log('Eliminazione appuntamento da Supabase:', appointmentId);
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);
    if (error) {
      console.error('Errore SQL nell\'eliminazione appuntamento:', error);
      throw error;
    }
    console.log('Appuntamento eliminato con successo');
  } catch (error) {
    console.error('Errore nell\'eliminare appuntamento da Supabase:', error);
    throw error;
  }
};
