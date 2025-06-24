import { supabase } from '@/integrations/supabase/client';
import { Client, RecurringTreatment } from '@/types/client';
import { Appointment } from '@/types/appointment';

// Client operations
export const loadClientsFromSupabase = async (): Promise<Client[]> => {
  try {
    console.log('DEBUG - Caricamento clienti da Supabase...');
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('DEBUG - Errore nel caricamento clienti:', error);
      throw error;
    }
    
    console.log('DEBUG - Clienti caricati da DB:', data?.length || 0, data);
    return data || [];
  } catch (error) {
    console.error('DEBUG - Errore nel caricare i clienti da Supabase:', error);
    return [];
  }
};

export const addClientToSupabase = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
  try {
    console.log('DEBUG - Aggiunta cliente a Supabase:', client);
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
      
    if (error) {
      console.error('DEBUG - Errore nell\'aggiunta cliente:', error);
      throw error;
    }
    
    console.log('DEBUG - Cliente aggiunto con successo:', data);
    return data;
  } catch (error) {
    console.error('DEBUG - Errore nell\'aggiungere cliente su Supabase:', error);
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

// Get client appointments history - FIXED to properly show appointments
export const getClientAppointmentsFromSupabase = async (clientId: string): Promise<Appointment[]> => {
  try {
    console.log('DEBUG - Caricamento storico appuntamenti per cliente:', clientId);
    
    // Load appointments by client_id
    const { data: appointmentsData, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('DEBUG - Errore nel caricamento storico appuntamenti:', error);
      throw error;
    }
    
    console.log('DEBUG - Appuntamenti raw da DB:', appointmentsData);
    
    const appointments = appointmentsData?.map(app => ({
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
    
    console.log('DEBUG - Appuntamenti trasformati per cliente', clientId, ':', appointments.length, appointments);
    return appointments;
  } catch (error) {
    console.error('DEBUG - Errore nel caricare lo storico appuntamenti da Supabase:', error);
    return [];
  }
};

// NEW: Funzione per generare appuntamenti da trattamenti ricorrenti con nome cliente
export const generateRecurringAppointments = async (
  treatments: RecurringTreatment[],
  clients: Client[],
  startDate: Date,
  endDate: Date
): Promise<Appointment[]> => {
  try {
    console.log('DEBUG - Generazione appuntamenti ricorrenti da:', startDate, 'a:', endDate);
    console.log('DEBUG - Trattamenti ricorrenti attivi:', treatments.length);
    console.log('DEBUG - Clienti disponibili:', clients.length);
    
    const generatedAppointments: Appointment[] = [];
    
    for (const treatment of treatments) {
      if (!treatment.is_active) continue;
      
      // Trova il cliente associato al trattamento
      const client = clients.find(c => c.id === treatment.client_id);
      if (!client) {
        console.warn('DEBUG - Cliente non trovato per trattamento:', treatment.id);
        continue;
      }
      
      console.log('DEBUG - Processando trattamento per cliente:', client.name);
      
      // Genera le date degli appuntamenti basate sulla frequenza
      const appointmentDates = generateAppointmentDates(treatment, startDate, endDate);
      
      for (const appointmentDate of appointmentDates) {
        const appointment: Appointment = {
          id: `recurring-${treatment.id}-${appointmentDate.toISOString()}`,
          employeeId: treatment.employee_id,
          date: appointmentDate.toISOString().split('T')[0],
          time: treatment.preferred_time || '09:00',
          title: `${treatment.service_type} (Ricorrente)`,
          client: client.name, // Nome del cliente dal database
          duration: treatment.duration,
          notes: treatment.notes || 'Appuntamento generato automaticamente da trattamento ricorrente',
          email: client.email || '',
          phone: client.phone || '',
          color: 'bg-purple-100 border-purple-300 text-purple-800', // Colore distintivo per ricorrenti
          serviceType: treatment.service_type,
          clientId: client.id
        };
        
        generatedAppointments.push(appointment);
      }
    }
    
    console.log('DEBUG - Appuntamenti ricorrenti generati:', generatedAppointments.length);
    return generatedAppointments;
  } catch (error) {
    console.error('DEBUG - Errore nella generazione appuntamenti ricorrenti:', error);
    return [];
  }
};

// Helper function per generare le date degli appuntamenti
const generateAppointmentDates = (treatment: RecurringTreatment, startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const treatmentStartDate = new Date(treatment.start_date);
  const treatmentEndDate = treatment.end_date ? new Date(treatment.end_date) : null;
  
  // Inizia dalla data di inizio del trattamento o dalla data di inizio richiesta, quale è più tarda
  let currentDate = new Date(Math.max(treatmentStartDate.getTime(), startDate.getTime()));
  
  while (currentDate <= endDate) {
    // Controlla se siamo oltre la data di fine del trattamento
    if (treatmentEndDate && currentDate > treatmentEndDate) {
      break;
    }
    
    if (treatment.frequency_type === 'weekly' && treatment.preferred_day_of_week !== null) {
      // Per frequenza settimanale, trova il prossimo giorno della settimana preferito
      const dayOfWeek = currentDate.getDay();
      const daysUntilPreferred = (treatment.preferred_day_of_week - dayOfWeek + 7) % 7;
      
      if (daysUntilPreferred === 0 && currentDate >= treatmentStartDate) {
        dates.push(new Date(currentDate));
      }
      
      // Avanza alla prossima settimana
      currentDate.setDate(currentDate.getDate() + (daysUntilPreferred === 0 ? 7 * treatment.frequency_value : daysUntilPreferred));
    } else if (treatment.frequency_type === 'monthly' && treatment.preferred_day_of_month) {
      // Per frequenza mensile, trova il prossimo giorno del mese preferito
      const targetDay = treatment.preferred_day_of_month;
      
      // Imposta al giorno target del mese corrente
      currentDate.setDate(targetDay);
      
      if (currentDate >= treatmentStartDate && currentDate >= startDate) {
        dates.push(new Date(currentDate));
      }
      
      // Avanza al prossimo mese
      currentDate.setMonth(currentDate.getMonth() + treatment.frequency_value);
    } else {
      // Se non ci sono preferenze specifiche, avanza semplicemente
      currentDate.setDate(currentDate.getDate() + 7); // Default a settimanale
    }
  }
  
  return dates;
};
