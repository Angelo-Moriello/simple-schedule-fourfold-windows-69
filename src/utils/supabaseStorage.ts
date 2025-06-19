
import { supabase } from '@/integrations/supabase/client';
import { Appointment, Employee } from '@/types/appointment';

// Generate a proper UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Employee operations
export const saveEmployeesToSupabase = async (employees: Employee[]) => {
  try {
    console.log('Salvataggio dipendenti su Supabase:', employees);
    
    // First, clear existing employees
    const { error: deleteError } = await supabase.from('employees').delete().neq('id', 0);
    if (deleteError) {
      console.error('Errore nella cancellazione dipendenti esistenti:', deleteError);
      throw deleteError;
    }
    
    // Insert new employees
    if (employees.length > 0) {
      const { error: insertError } = await supabase.from('employees').insert(
        employees.map(emp => ({
          id: emp.id,
          name: emp.name,
          color: emp.color,
          specialization: emp.specialization,
          vacations: emp.vacations || []
        }))
      );
      if (insertError) {
        console.error('Errore nell\'inserimento dipendenti:', insertError);
        throw insertError;
      }
    }
    console.log('Dipendenti salvati con successo');
  } catch (error) {
    console.error('Errore nel salvare i dipendenti su Supabase:', error);
    throw error;
  }
};

export const loadEmployeesFromSupabase = async (): Promise<Employee[]> => {
  try {
    console.log('Caricamento dipendenti da Supabase...');
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Errore nel caricamento dipendenti:', error);
      throw error;
    }
    
    const employees = data?.map(emp => ({
      id: emp.id,
      name: emp.name,
      color: emp.color,
      specialization: emp.specialization as 'Parrucchiere' | 'Estetista',
      vacations: emp.vacations || []
    })) || [];
    
    console.log('Dipendenti caricati:', employees);
    return employees;
  } catch (error) {
    console.error('Errore nel caricare i dipendenti da Supabase:', error);
    return [];
  }
};

export const addEmployeeToSupabase = async (employee: Employee) => {
  try {
    console.log('Aggiunta dipendente a Supabase:', employee);
    const { error } = await supabase.from('employees').insert({
      id: employee.id,
      name: employee.name,
      color: employee.color,
      specialization: employee.specialization,
      vacations: employee.vacations || []
    });
    if (error) {
      console.error('Errore SQL nell\'aggiunta dipendente:', error);
      throw error;
    }
    console.log('Dipendente aggiunto con successo');
  } catch (error) {
    console.error('Errore nell\'aggiungere dipendente su Supabase:', error);
    throw error;
  }
};

export const updateEmployeeInSupabase = async (employee: Employee) => {
  try {
    console.log('Aggiornamento dipendente su Supabase:', employee);
    const { error } = await supabase
      .from('employees')
      .update({
        name: employee.name,
        color: employee.color,
        specialization: employee.specialization,
        vacations: employee.vacations || []
      })
      .eq('id', employee.id);
    if (error) {
      console.error('Errore SQL nell\'aggiornamento dipendente:', error);
      throw error;
    }
    console.log('Dipendente aggiornato con successo');
  } catch (error) {
    console.error('Errore nell\'aggiornare dipendente su Supabase:', error);
    throw error;
  }
};

export const deleteEmployeeFromSupabase = async (employeeId: number) => {
  try {
    console.log('Eliminazione dipendente da Supabase:', employeeId);
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);
    if (error) {
      console.error('Errore SQL nell\'eliminazione dipendente:', error);
      throw error;
    }
    console.log('Dipendente eliminato con successo');
  } catch (error) {
    console.error('Errore nell\'eliminare dipendente da Supabase:', error);
    throw error;
  }
};

// Appointment operations
export const saveAppointmentsToSupabase = async (appointments: Appointment[]) => {
  try {
    console.log('Salvataggio appuntamenti su Supabase:', appointments);
    
    // First, clear existing appointments - use proper condition to avoid UUID errors
    const { error: deleteError } = await supabase.from('appointments').delete().gt('created_at', '2000-01-01');
    if (deleteError) {
      console.error('Errore nella cancellazione appuntamenti esistenti:', deleteError);
      throw deleteError;
    }
    
    // Insert new appointments with proper UUID conversion
    if (appointments.length > 0) {
      const appointmentsToInsert = appointments.map(app => ({
        id: app.id.includes('-') ? app.id : generateUUID(), // Convert timestamp IDs to UUID
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
        service_type: app.serviceType
      }));
      
      console.log('Appuntamenti con UUID corretti:', appointmentsToInsert);
      
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
    
    const appointments = data?.map(app => ({
      id: app.id,
      employeeId: app.employee_id,
      date: app.date,
      time: app.time,
      title: app.title,
      client: app.client,
      duration: app.duration,
      notes: app.notes || '',
      email: app.email || '',
      phone: app.phone || '',
      color: app.color,
      serviceType: app.service_type
    })) || [];
    
    console.log('Appuntamenti caricati:', appointments);
    return appointments;
  } catch (error) {
    console.error('Errore nel caricare gli appuntamenti da Supabase:', error);
    return [];
  }
};

export const addAppointmentToSupabase = async (appointment: Appointment) => {
  try {
    console.log('Aggiunta appuntamento a Supabase:', appointment);
    
    // Ensure we have a proper UUID
    const appointmentId = appointment.id.includes('-') ? appointment.id : generateUUID();
    
    const { error } = await supabase.from('appointments').insert({
      id: appointmentId,
      employee_id: appointment.employeeId,
      date: appointment.date,
      time: appointment.time,
      title: appointment.title,
      client: appointment.client,
      duration: appointment.duration,
      notes: appointment.notes,
      email: appointment.email,
      phone: appointment.phone,
      color: appointment.color,
      service_type: appointment.serviceType
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
    const { error } = await supabase
      .from('appointments')
      .update({
        employee_id: appointment.employeeId,
        date: appointment.date,
        time: appointment.time,
        title: appointment.title,
        client: appointment.client,
        duration: appointment.duration,
        notes: appointment.notes,
        email: appointment.email,
        phone: appointment.phone,
        color: appointment.color,
        service_type: appointment.serviceType
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

// Migration utility to transfer localStorage data to Supabase
export const migrateLocalStorageToSupabase = async () => {
  try {
    console.log('Inizio migrazione da localStorage a Supabase...');
    
    // Load data from localStorage
    const storedEmployees = localStorage.getItem('employees');
    const storedAppointments = localStorage.getItem('appointments');
    
    if (storedEmployees) {
      const employees = JSON.parse(storedEmployees);
      console.log('Dipendenti da migrare:', employees);
      if (employees.length > 0) {
        await saveEmployeesToSupabase(employees);
        console.log('Dipendenti migrati con successo');
      }
    }
    
    if (storedAppointments) {
      const appointments = JSON.parse(storedAppointments);
      console.log('Appuntamenti da migrare:', appointments);
      if (appointments.length > 0) {
        // Convert timestamp IDs to UUIDs during migration
        const appointmentsWithUUIDs = appointments.map((app: Appointment) => ({
          ...app,
          id: app.id.includes('-') ? app.id : generateUUID() // Convert timestamp IDs to UUID
        }));
        await saveAppointmentsToSupabase(appointmentsWithUUIDs);
        console.log('Appuntamenti migrati con successo');
      }
    }
    
    console.log('Migrazione completata con successo');
    return true;
  } catch (error) {
    console.error('Errore nella migrazione:', error);
    return false;
  }
};
