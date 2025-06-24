
import { Appointment, Employee } from '@/types/appointment';
import { saveEmployeesToSupabase, loadEmployeesFromSupabase } from './employeeOperations';
import { saveAppointmentsToSupabase, loadAppointmentsFromSupabase } from './appointmentOperations';

// Generate a proper UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Migration utility to transfer localStorage data to Supabase
export const migrateLocalStorageToSupabase = async () => {
  try {
    console.log('Inizio migrazione da localStorage a Supabase...');
    
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
        const appointmentsWithUUIDs = appointments.map((app: Appointment) => ({
          ...app,
          id: app.id.includes('-') ? app.id : generateUUID()
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

// Force refresh data from Supabase
export const refreshDataFromSupabase = async () => {
  try {
    console.log('Aggiornamento forzato dei dati da Supabase...');
    const [employees, appointments] = await Promise.all([
      loadEmployeesFromSupabase(),
      loadAppointmentsFromSupabase()
    ]);
    
    return { employees, appointments };
  } catch (error) {
    console.error('Errore nell\'aggiornamento dei dati:', error);
    throw error;
  }
};
