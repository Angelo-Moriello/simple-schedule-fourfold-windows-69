
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types/appointment';
import { generateUUID, findClientIdByName } from './appointmentHelpers';

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
          id: app.id.includes('-') ? app.id : generateUUID(),
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
          client_id: clientId
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
    console.log('Aggiunta appuntamento a Supabase:', appointment);
    
    const appointmentId = appointment.id.includes('-') ? appointment.id : generateUUID();
    
    let clientId = appointment.clientId;
    if (!clientId && appointment.client) {
      clientId = await findClientIdByName(appointment.client);
    }
    
    const { error } = await supabase.from('appointments').insert({
      id: appointmentId,
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
      client_id: clientId
    });
    if (error) {
      console.error('Errore SQL nell\'aggiunta appuntamento:', error);
      throw error;
    }
    console.log('Appuntamento aggiunto con successo');
  } catch (error) {
    console.error('Errore nell\'aggiungere appuntamento su Supabase:', error);
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
        client_id: clientId
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
