
import { format, addWeeks, addMonths, isAfter, isBefore } from 'date-fns';
import { RecurringTreatment } from '@/types/client';
import { Appointment } from '@/types/appointment';
import { addAppointmentToSupabase, loadAppointmentsFromSupabase } from '@/utils/supabaseStorage';
import { supabase } from '@/integrations/supabase/client';

// Helper function to get client info by ID
const getClientInfo = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('name, email, phone')
      .eq('id', clientId)
      .maybeSingle();
    
    if (error) {
      console.error('Errore nel recupero info cliente per ricorrente:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Errore nel recupero info cliente per ricorrente:', error);
    return null;
  }
};

export const generateRecurringAppointments = async (
  treatment: RecurringTreatment,
  startDate: Date,
  endDate: Date
): Promise<Appointment[]> => {
  console.log('Generazione appuntamenti ricorrenti:', { treatment, startDate, endDate });
  
  const generatedAppointments: Appointment[] = [];
  const existingAppointments = await loadAppointmentsFromSupabase();
  
  // Recupera le info del cliente
  const clientInfo = await getClientInfo(treatment.client_id);
  console.log('DEBUG - Info cliente per appuntamento ricorrente:', clientInfo);
  
  let currentDate = new Date(Math.max(new Date(treatment.start_date).getTime(), startDate.getTime()));
  const treatmentEndDate = treatment.end_date ? new Date(treatment.end_date) : endDate;
  
  while (isBefore(currentDate, treatmentEndDate) && isBefore(currentDate, endDate)) {
    // Verifica se è il giorno giusto della settimana/mese
    const shouldCreateAppointment = checkIfShouldCreateAppointment(treatment, currentDate);
    
    if (shouldCreateAppointment) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      
      // Verifica se esiste già un appuntamento per questo cliente in questa data
      const existingAppointment = existingAppointments.find(apt => 
        apt.clientId === treatment.client_id &&
        apt.employeeId === treatment.employee_id &&
        apt.date === dateString
      );
      
      if (!existingAppointment) {
        const newAppointment: Appointment = {
          id: crypto.randomUUID(),
          employeeId: treatment.employee_id,
          date: dateString,
          time: treatment.preferred_time || '09:00',
          title: `${treatment.service_type} (Ricorrente)`,
          client: clientInfo?.name || '', // Usa il nome del cliente dal database
          duration: treatment.duration,
          notes: treatment.notes || 'Appuntamento generato automaticamente',
          email: clientInfo?.email || '',
          phone: clientInfo?.phone || '',
          color: '#22c55e', // Verde per trattamenti ricorrenti
          serviceType: treatment.service_type,
          clientId: treatment.client_id
        };
        
        console.log('DEBUG - Appuntamento ricorrente generato con info cliente:', newAppointment);
        generatedAppointments.push(newAppointment);
      }
    }
    
    // Avanza alla prossima data
    if (treatment.frequency_type === 'weekly') {
      currentDate = addWeeks(currentDate, treatment.frequency_value);
    } else {
      currentDate = addMonths(currentDate, treatment.frequency_value);
    }
  }
  
  return generatedAppointments;
};

const checkIfShouldCreateAppointment = (treatment: RecurringTreatment, date: Date): boolean => {
  if (treatment.frequency_type === 'weekly') {
    return treatment.preferred_day_of_week === date.getDay();
  } else if (treatment.frequency_type === 'monthly') {
    return treatment.preferred_day_of_month === date.getDate();
  }
  return false;
};

export const generateAppointmentsForDateRange = async (
  treatments: RecurringTreatment[],
  startDate: Date,
  endDate: Date
): Promise<void> => {
  console.log('Generazione appuntamenti per range di date:', { startDate, endDate });
  
  for (const treatment of treatments.filter(t => t.is_active)) {
    try {
      const appointments = await generateRecurringAppointments(treatment, startDate, endDate);
      
      for (const appointment of appointments) {
        try {
          await addAppointmentToSupabase(appointment);
          console.log('Appuntamento ricorrente creato:', appointment);
        } catch (error) {
          console.error('Errore nella creazione appuntamento ricorrente:', error);
        }
      }
    } catch (error) {
      console.error('Errore nella generazione appuntamenti per trattamento:', treatment.id, error);
    }
  }
};
