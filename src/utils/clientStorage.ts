
import { supabase } from '@/integrations/supabase/client';
import { Client, RecurringTreatment } from '@/types/client';
import { Appointment } from '@/types/appointment';

// Client operations
export const loadClientsFromSupabase = async (): Promise<Client[]> => {
  try {
    console.log('Caricamento clienti da Supabase...');
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Errore nel caricamento clienti:', error);
      throw error;
    }
    
    console.log('Clienti caricati:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Errore nel caricare i clienti da Supabase:', error);
    return [];
  }
};

export const addClientToSupabase = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
  try {
    console.log('Aggiunta cliente a Supabase:', client);
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
      
    if (error) {
      console.error('Errore nell\'aggiunta cliente:', error);
      throw error;
    }
    
    console.log('Cliente aggiunto con successo:', data);
    return data;
  } catch (error) {
    console.error('Errore nell\'aggiungere cliente su Supabase:', error);
    throw error;
  }
};

export const updateClientInSupabase = async (client: Client): Promise<void> => {
  try {
    console.log('Aggiornamento cliente su Supabase:', client);
    const { error } = await supabase
      .from('clients')
      .update({
        name: client.name,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', client.id);
      
    if (error) {
      console.error('Errore nell\'aggiornamento cliente:', error);
      throw error;
    }
    
    console.log('Cliente aggiornato con successo');
  } catch (error) {
    console.error('Errore nell\'aggiornare cliente su Supabase:', error);
    throw error;
  }
};

export const deleteClientFromSupabase = async (clientId: string): Promise<void> => {
  try {
    console.log('Eliminazione cliente da Supabase:', clientId);
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);
      
    if (error) {
      console.error('Errore nell\'eliminazione cliente:', error);
      throw error;
    }
    
    console.log('Cliente eliminato con successo');
  } catch (error) {
    console.error('Errore nell\'eliminare cliente da Supabase:', error);
    throw error;
  }
};

// Recurring treatments operations
export const loadRecurringTreatmentsFromSupabase = async (clientId?: string): Promise<RecurringTreatment[]> => {
  try {
    console.log('Caricamento trattamenti ricorrenti da Supabase...');
    let query = supabase.from('recurring_treatments').select('*');
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Errore nel caricamento trattamenti ricorrenti:', error);
      throw error;
    }
    
    // Cast frequency_type to the correct type
    const treatments = data?.map(treatment => ({
      ...treatment,
      frequency_type: treatment.frequency_type as 'weekly' | 'monthly'
    })) || [];
    
    console.log('Trattamenti ricorrenti caricati:', treatments.length);
    return treatments;
  } catch (error) {
    console.error('Errore nel caricare i trattamenti ricorrenti da Supabase:', error);
    return [];
  }
};

export const addRecurringTreatmentToSupabase = async (treatment: Omit<RecurringTreatment, 'id' | 'created_at' | 'updated_at'>): Promise<RecurringTreatment> => {
  try {
    console.log('Aggiunta trattamento ricorrente a Supabase:', treatment);
    const { data, error } = await supabase
      .from('recurring_treatments')
      .insert(treatment)
      .select()
      .single();
      
    if (error) {
      console.error('Errore nell\'aggiunta trattamento ricorrente:', error);
      throw error;
    }
    
    // Cast frequency_type to the correct type
    const result = {
      ...data,
      frequency_type: data.frequency_type as 'weekly' | 'monthly'
    };
    
    console.log('Trattamento ricorrente aggiunto con successo:', result);
    return result;
  } catch (error) {
    console.error('Errore nell\'aggiungere trattamento ricorrente su Supabase:', error);
    throw error;
  }
};

export const updateRecurringTreatmentInSupabase = async (treatment: RecurringTreatment): Promise<void> => {
  try {
    console.log('Aggiornamento trattamento ricorrente su Supabase:', treatment);
    const { error } = await supabase
      .from('recurring_treatments')
      .update({
        employee_id: treatment.employee_id,
        service_type: treatment.service_type,
        duration: treatment.duration,
        notes: treatment.notes,
        frequency_type: treatment.frequency_type,
        frequency_value: treatment.frequency_value,
        preferred_day_of_week: treatment.preferred_day_of_week,
        preferred_day_of_month: treatment.preferred_day_of_month,
        preferred_time: treatment.preferred_time,
        is_active: treatment.is_active,
        start_date: treatment.start_date,
        end_date: treatment.end_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', treatment.id);
      
    if (error) {
      console.error('Errore nell\'aggiornamento trattamento ricorrente:', error);
      throw error;
    }
    
    console.log('Trattamento ricorrente aggiornato con successo');
  } catch (error) {
    console.error('Errore nell\'aggiornare trattamento ricorrente su Supabase:', error);
    throw error;
  }
};

export const deleteRecurringTreatmentFromSupabase = async (treatmentId: string): Promise<void> => {
  try {
    console.log('Eliminazione trattamento ricorrente da Supabase:', treatmentId);
    const { error } = await supabase
      .from('recurring_treatments')
      .delete()
      .eq('id', treatmentId);
      
    if (error) {
      console.error('Errore nell\'eliminazione trattamento ricorrente:', error);
      throw error;
    }
    
    console.log('Trattamento ricorrente eliminato con successo');
  } catch (error) {
    console.error('Errore nell\'eliminare trattamento ricorrente da Supabase:', error);
    throw error;
  }
};

// Get client appointments history
export const getClientAppointmentsFromSupabase = async (clientId: string): Promise<Appointment[]> => {
  try {
    console.log('Caricamento storico appuntamenti cliente da Supabase...');
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Errore nel caricamento storico appuntamenti:', error);
      throw error;
    }
    
    const appointments = data?.map(app => ({
      id: app.id,
      employeeId: app.employee_id,
      date: app.date,
      time: app.time,
      title: app.title || '',
      client: app.client,
      duration: app.duration,
      notes: app.notes || '',
      email: app.email || '',
      phone: app.phone || '',
      color: app.color,
      serviceType: app.service_type,
      clientId: app.client_id
    })) || [];
    
    console.log('Storico appuntamenti caricato:', appointments.length);
    return appointments;
  } catch (error) {
    console.error('Errore nel caricare lo storico appuntamenti da Supabase:', error);
    return [];
  }
};
