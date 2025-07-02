
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types/appointment';
import { RecurringTreatment, Client } from '@/types/client';

export const getClientAppointmentsFromSupabase = async (clientId: string): Promise<Appointment[]> => {
  try {
    console.log('DEBUG - Caricamento storico appuntamenti per cliente:', clientId);
    
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
    
    if (!appointmentsData) {
      return [];
    }
    
    const appointments = appointmentsData.map(app => ({
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
    }));
    
    console.log('DEBUG - Appuntamenti trasformati per cliente', clientId, ':', appointments.length, appointments);
    return appointments;
  } catch (error) {
    console.error('DEBUG - Errore nel caricare lo storico appuntamenti da Supabase:', error);
    return [];
  }
};

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
      
      const client = clients.find(c => c.id === treatment.client_id);
      if (!client) {
        console.warn('DEBUG - Cliente non trovato per trattamento:', treatment.id);
        continue;
      }
      
      console.log('DEBUG - Processando trattamento per cliente:', client.name);
      
      const appointmentDates = generateAppointmentDates(treatment, startDate, endDate);
      
      for (const appointmentDate of appointmentDates) {
        const appointment: Appointment = {
          id: `recurring-${treatment.id}-${appointmentDate.toISOString()}`,
          employeeId: treatment.employee_id,
          date: appointmentDate.toISOString().split('T')[0],
          time: treatment.preferred_time || '09:00',
          title: `${treatment.service_type} (Ricorrente)`,
          client: client.name,
          duration: treatment.duration,
          notes: treatment.notes || 'Appuntamento generato automaticamente da trattamento ricorrente',
          email: client.email || '',
          phone: client.phone || '',
          color: 'bg-purple-100 border-purple-300 text-purple-800',
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

const generateAppointmentDates = (treatment: RecurringTreatment, startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const treatmentStartDate = new Date(treatment.start_date);
  const treatmentEndDate = treatment.end_date ? new Date(treatment.end_date) : null;
  
  let currentDate = new Date(Math.max(treatmentStartDate.getTime(), startDate.getTime()));
  
  while (currentDate <= endDate) {
    if (treatmentEndDate && currentDate > treatmentEndDate) {
      break;
    }
    
    if (treatment.frequency_type === 'weekly' && treatment.preferred_day_of_week !== null) {
      const dayOfWeek = currentDate.getDay();
      const daysUntilPreferred = (treatment.preferred_day_of_week - dayOfWeek + 7) % 7;
      
      if (daysUntilPreferred === 0 && currentDate >= treatmentStartDate) {
        dates.push(new Date(currentDate));
      }
      
      currentDate.setDate(currentDate.getDate() + (daysUntilPreferred === 0 ? 7 * treatment.frequency_value : daysUntilPreferred));
    } else if (treatment.frequency_type === 'monthly' && treatment.preferred_day_of_month) {
      const targetDay = treatment.preferred_day_of_month;
      
      currentDate.setDate(targetDay);
      
      if (currentDate >= treatmentStartDate && currentDate >= startDate) {
        dates.push(new Date(currentDate));
      }
      
      currentDate.setMonth(currentDate.getMonth() + treatment.frequency_value);
    } else {
      currentDate.setDate(currentDate.getDate() + 7);
    }
  }
  
  return dates;
};
