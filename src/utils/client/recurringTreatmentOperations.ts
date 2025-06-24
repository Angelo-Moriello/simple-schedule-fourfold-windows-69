
import { supabase } from '@/integrations/supabase/client';
import { RecurringTreatment } from '@/types/client';

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
