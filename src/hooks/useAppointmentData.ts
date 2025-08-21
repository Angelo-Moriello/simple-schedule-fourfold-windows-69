
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

  // Rigenera appuntamenti ricorrenti quando cambia la data selezionata
  useEffect(() => {
    let cancelled = false;
    const generateRecurringAndReload = async () => {
      try {
        const recurringTreatments = await loadRecurringTreatmentsFromSupabase();
        const startDate = subDays(selectedDate, 30);
        const endDate = addDays(selectedDate, 30);

        // Genera solo i ricorrenti nel range della data selezionata
        await generateAppointmentsForDateRange(recurringTreatments, startDate, endDate);
        console.log('Appuntamenti ricorrenti generati per il periodo', { startDate, endDate });

        // IMPORTANTE: ricarica TUTTI gli appuntamenti dal database (non solo quelli del range)
        // per mantenere visibili anche gli appuntamenti di altri mesi come luglio
        const allAppointments = await loadAppointmentsFromSupabase();
        if (!cancelled) {
          setAppointments(allAppointments);
          console.log('Ricaricati tutti gli appuntamenti dal database:', allAppointments.length);
        }
      } catch (recurringError) {
        console.error('Errore nella generazione appuntamenti ricorrenti:', recurringError);
      }
    };

    generateRecurringAndReload();
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
