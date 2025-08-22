
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types/appointment';
import { getClientInfo } from './appointmentHelpers';

export const loadAppointmentsFromSupabase = async (): Promise<Appointment[]> => {
  try {
    console.log('Caricamento appuntamenti da Supabase con paginazione...');

    const pageSize = 1000; // massimo consigliato da PostgREST
    let from = 0;
    let to = pageSize - 1;
    let totalFetched = 0;
    const allRows: any[] = [];

    // Cicla finché arrivano batch pieni; se un batch è < pageSize, è l'ultimo
    for (let page = 0; page < 200; page++) { // guardia di sicurezza
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Errore nel caricamento appuntamenti (pagina):', { error, from, to });
        throw error;
      }

      const batch = data || [];
      allRows.push(...batch);
      totalFetched += batch.length;

      console.log(`Batch ${page + 1}: ricevuti ${batch.length} (range ${from}-${to})`);

      if (batch.length < pageSize) break;

      from += pageSize;
      to += pageSize;
    }

    // Arricchisci i dati con info cliente se necessario
    const appointments = await Promise.all(allRows.map(async (app) => {
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
      } as Appointment;
    }));

    console.log(`✅ Appuntamenti caricati (totale unito): ${appointments.length}`);
    return appointments;
  } catch (error) {
    console.error('Errore nel caricare gli appuntamenti da Supabase:', error);
    return [];
  }
};

export const getAppointmentsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Errore nel conteggio appuntamenti:', error);
      throw error;
    }

    const total = count ?? 0;
    console.log(`Conteggio appuntamenti (DB): ${total}`);
    return total;
  } catch (error) {
    console.error('Errore nel recuperare il conteggio appuntamenti:', error);
    return 0;
  }
};
