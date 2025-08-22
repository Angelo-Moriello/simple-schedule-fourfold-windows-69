
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types/appointment';
import { getClientInfo } from './appointmentHelpers';

export const loadAppointmentsFromSupabase = async (): Promise<Appointment[]> => {
  try {
    console.log('Caricamento appuntamenti da Supabase...');
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Errore nel caricamento appuntamenti:', error);
      throw error;
    }
    
    const appointments = await Promise.all((data || []).map(async (app) => {
      let clientName = app.client;
      let clientEmail = app.email || '';
      let clientPhone = app.phone || '';
      
      if ((!clientName || clientName.trim() === '') && app.client_id) {
        console.log('DEBUG - Recupero info cliente per ID:', app.client_id);
        const clientInfo = await getClientInfo(app.client_id);
        if (clientInfo) {
          clientName = clientInfo.name;
          clientEmail = clientInfo.email || app.email || '';
          clientPhone = clientInfo.phone || app.phone || '';
          console.log('DEBUG - Info cliente recuperate:', clientInfo);
        }
      }
      
      return {
        id: app.id,
        employeeId: app.employee_id,
        date: app.date,
        time: app.time,
        title: app.title || '',
        client: clientName || '',
        duration: app.duration,
        notes: app.notes || '',
        email: clientEmail,
        phone: clientPhone,
        color: app.color,
        serviceType: app.service_type,
        clientId: app.client_id
      };
    }));
    
    console.log(`✅ Appuntamenti caricati: ${appointments.length} su ${data?.length || 0} record dal database`);
    return appointments;
  } catch (error) {
    console.error('Errore nel caricare gli appuntamenti da Supabase:', error);
    return [];
  }
};
