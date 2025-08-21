
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Appointment, Employee } from '@/types/appointment';
import { 
  loadEmployeesFromSupabase, 
  migrateLocalStorageToSupabase
} from '@/utils/supabaseStorage';
import { loadRecurringTreatmentsFromSupabase } from '@/utils/clientStorage';
import { generateAppointmentsForDateRange } from '@/utils/recurringTreatmentUtils';
import { addDays, subDays } from 'date-fns';
import { useAppointmentSync } from './useAppointmentSync';

export const useAppointmentData = (selectedDate: Date) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Usa il nuovo sistema di sincronizzazione per gli appuntamenti
  const { 
    appointments, 
    isLoading: appointmentsLoading, 
    updateAppointmentSync,
    refreshData: refreshAppointments,
    getEmployeeAppointmentCount,
    getEmployeeAppointments
  } = useAppointmentSync();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Migrazione dati locali se necessaria (solo una volta)
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

        // Carica i dipendenti
        const loadedEmployees = await loadEmployeesFromSupabase();
        setEmployees(loadedEmployees);

        console.log('DEBUG - Dipendenti caricati:', loadedEmployees.length);
        toast.success(`Caricati ${loadedEmployees.length} dipendenti`);
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
    const generateRecurringAppointments = async () => {
      try {
        const recurringTreatments = await loadRecurringTreatmentsFromSupabase();
        // Range esteso a 1 anno per coprire tutti gli appuntamenti ricorrenti
        const startDate = subDays(selectedDate, 365);
        const endDate = addDays(selectedDate, 365);

        await generateAppointmentsForDateRange(recurringTreatments, startDate, endDate);
        console.log('Appuntamenti ricorrenti generati per il periodo esteso (1 anno):', { startDate, endDate });

        // Refresh degli appuntamenti dopo la generazione
        if (!cancelled) {
          await refreshAppointments();
        }
      } catch (recurringError) {
        console.error('Errore nella generazione appuntamenti ricorrenti:', recurringError);
      }
    };

    generateRecurringAppointments();
    return () => { cancelled = true; };
  }, [selectedDate, refreshAppointments]);

  return {
    appointments,
    employees,
    isLoading: isLoading || appointmentsLoading,
    setAppointments: (newAppointments: Appointment[] | ((prev: Appointment[]) => Appointment[])) => {
      // Per compatibilità con il codice esistente, ma ora gestito dal sync
      console.warn('setAppointments chiamato direttamente - usa updateAppointmentSync invece');
    },
    setEmployees,
    updateAppointmentSync,
    refreshAppointments,
    getEmployeeAppointmentCount,
    getEmployeeAppointments
  };
};
