
import { supabase } from '@/integrations/supabase/client';
import { Appointment, Employee } from '@/types/appointment';

// Employee operations
export const saveEmployeesToSupabase = async (employees: Employee[]) => {
  try {
    // First, clear existing employees
    await supabase.from('employees').delete().neq('id', 0);
    
    // Insert new employees
    if (employees.length > 0) {
      const { error } = await supabase.from('employees').insert(
        employees.map(emp => ({
          id: emp.id,
          name: emp.name,
          color: emp.color,
          specialization: emp.specialization,
          vacations: emp.vacations || []
        }))
      );
      if (error) throw error;
    }
  } catch (error) {
    console.error('Errore nel salvare i dipendenti su Supabase:', error);
    throw error;
  }
};

export const loadEmployeesFromSupabase = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    return data?.map(emp => ({
      id: emp.id,
      name: emp.name,
      color: emp.color,
      specialization: emp.specialization as 'Parrucchiere' | 'Estetista',
      vacations: emp.vacations || []
    })) || [];
  } catch (error) {
    console.error('Errore nel caricare i dipendenti da Supabase:', error);
    return [];
  }
};

export const addEmployeeToSupabase = async (employee: Employee) => {
  try {
    const { error } = await supabase.from('employees').insert({
      id: employee.id,
      name: employee.name,
      color: employee.color,
      specialization: employee.specialization,
      vacations: employee.vacations || []
    });
    if (error) throw error;
  } catch (error) {
    console.error('Errore nell\'aggiungere dipendente su Supabase:', error);
    throw error;
  }
};

export const updateEmployeeInSupabase = async (employee: Employee) => {
  try {
    const { error } = await supabase
      .from('employees')
      .update({
        name: employee.name,
        color: employee.color,
        specialization: employee.specialization,
        vacations: employee.vacations || []
      })
      .eq('id', employee.id);
    if (error) throw error;
  } catch (error) {
    console.error('Errore nell\'aggiornare dipendente su Supabase:', error);
    throw error;
  }
};

export const deleteEmployeeFromSupabase = async (employeeId: number) => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);
    if (error) throw error;
  } catch (error) {
    console.error('Errore nell\'eliminare dipendente da Supabase:', error);
    throw error;
  }
};

// Appointment operations
export const saveAppointmentsToSupabase = async (appointments: Appointment[]) => {
  try {
    // First, clear existing appointments
    await supabase.from('appointments').delete().neq('id', '');
    
    // Insert new appointments
    if (appointments.length > 0) {
      const { error } = await supabase.from('appointments').insert(
        appointments.map(app => ({
          id: app.id,
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
        }))
      );
      if (error) throw error;
    }
  } catch (error) {
    console.error('Errore nel salvare gli appuntamenti su Supabase:', error);
    throw error;
  }
};

export const loadAppointmentsFromSupabase = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(app => ({
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
  } catch (error) {
    console.error('Errore nel caricare gli appuntamenti da Supabase:', error);
    return [];
  }
};

export const addAppointmentToSupabase = async (appointment: Appointment) => {
  try {
    const { error } = await supabase.from('appointments').insert({
      id: appointment.id,
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
    if (error) throw error;
  } catch (error) {
    console.error('Errore nell\'aggiungere appuntamento su Supabase:', error);
    throw error;
  }
};

export const updateAppointmentInSupabase = async (appointment: Appointment) => {
  try {
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
    if (error) throw error;
  } catch (error) {
    console.error('Errore nell\'aggiornare appuntamento su Supabase:', error);
    throw error;
  }
};

export const deleteAppointmentFromSupabase = async (appointmentId: string) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);
    if (error) throw error;
  } catch (error) {
    console.error('Errore nell\'eliminare appuntamento da Supabase:', error);
    throw error;
  }
};

// Migration utility to transfer localStorage data to Supabase
export const migrateLocalStorageToSupabase = async () => {
  try {
    // Load data from localStorage
    const storedEmployees = localStorage.getItem('employees');
    const storedAppointments = localStorage.getItem('appointments');
    
    if (storedEmployees) {
      const employees = JSON.parse(storedEmployees);
      if (employees.length > 0) {
        await saveEmployeesToSupabase(employees);
        console.log('Dipendenti migrati con successo');
      }
    }
    
    if (storedAppointments) {
      const appointments = JSON.parse(storedAppointments);
      if (appointments.length > 0) {
        await saveAppointmentsToSupabase(appointments);
        console.log('Appuntamenti migrati con successo');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Errore nella migrazione:', error);
    return false;
  }
};
