
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Appointment, Employee } from '@/types/appointment';
import { 
  loadEmployeesFromSupabase, 
  loadAppointmentsFromSupabase,
  migrateLocalStorageToSupabase
} from '@/utils/supabaseStorage';
import { loadRecurringTreatmentsFromSupabase } from '@/utils/clientStorage';
import { generateAppointmentsForDateRange } from '@/utils/recurringTreatmentUtils';
import { addDays, subDays } from 'date-fns';

export const useAppointmentData = (selectedDate: Date) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        // Migrazione eventuali dati locali (solo al mount)
        const hasLocalData = localStorage.getItem('employees') || localStorage.getItem('appointments');
        if (hasLocalData) {
          toast.info('Migrazione dati in corso...');
          const migrationSuccess = await migrateLocalStorageToSupabase();
          if (migrationSuccess) {
            localStorage.removeItem('employees');
            localStorage.removeItem('appointments');
            localStorage.removeItem('employeesTimestamp');
            localStorage.removeItem('appointmentsTimestamp');
            toast.success('Dati migrati con successo su Supabase!');
          } else {
            toast.error('Errore durante la migrazione dei dati');
          }
        }

        // Carica i dati di base
        const [loadedEmployees, loadedAppointments] = await Promise.all([
          loadEmployeesFromSupabase(),
          loadAppointmentsFromSupabase()
        ]);

        console.log('DEBUG - Initial data load:', { 
          employees: loadedEmployees.length, 
          appointments: loadedAppointments.length,
          appointmentDetails: loadedAppointments.map(apt => ({
            id: apt.id,
            employeeId: apt.employeeId,
            date: apt.date,
            time: apt.time,
            client: apt.client
          }))
        });

        setEmployees(loadedEmployees);
        setAppointments(loadedAppointments);

        toast.success(`Caricati ${loadedEmployees.length} dipendenti e ${loadedAppointments.length} appuntamenti`);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        toast.error('Errore nel caricamento dei dati da Supabase');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Rigenera appuntamenti ricorrenti e ricarica gli appuntamenti quando cambia la data selezionata (copre anche date passate)
  useEffect(() => {
    let cancelled = false;
    const generateAndReload = async () => {
      try {
        const recurringTreatments = await loadRecurringTreatmentsFromSupabase();
        const startDate = subDays(selectedDate, 30); // estende alle date passate
        const endDate = addDays(selectedDate, 30);

        await generateAppointmentsForDateRange(recurringTreatments, startDate, endDate);
        console.log('Appuntamenti ricorrenti generati per il periodo', { startDate, endDate });

        const finalAppointments = await loadAppointmentsFromSupabase();
        if (!cancelled) setAppointments(finalAppointments);
      } catch (recurringError) {
        console.error('Errore nella generazione appuntamenti ricorrenti:', recurringError);
      }
    };

    generateAndReload();
    return () => { cancelled = true; };
  }, [selectedDate]);

  return {
    appointments,
    employees,
    isLoading,
    setAppointments,
    setEmployees
  };
};
