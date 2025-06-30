
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Appointment, Employee } from '@/types/appointment';
import { 
  loadEmployeesFromSupabase, 
  loadAppointmentsFromSupabase,
  migrateLocalStorageToSupabase,
  clearAllVacationsFromSupabase
} from '@/utils/supabaseStorage';
import { loadRecurringTreatmentsFromSupabase } from '@/utils/clientStorage';
import { generateAppointmentsForDateRange } from '@/utils/recurringTreatmentUtils';
import { addDays, subDays } from 'date-fns';

export const useAppointmentData = (selectedDate: Date) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Clear all vacations first
        await clearAllVacationsFromSupabase();
        
        // Check if we need to migrate from localStorage
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
        
        // Load current data from Supabase
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
        
        // Generate recurring appointments
        try {
          const recurringTreatments = await loadRecurringTreatmentsFromSupabase();
          const startDate = subDays(selectedDate, 3);
          const endDate = addDays(selectedDate, 30);
          
          await generateAppointmentsForDateRange(recurringTreatments, startDate, endDate);
          console.log('Appuntamenti ricorrenti generati per il periodo');
        } catch (recurringError) {
          console.error('Errore nella generazione appuntamenti ricorrenti:', recurringError);
        }
        
        // Reload appointments after generation
        const finalAppointments = await loadAppointmentsFromSupabase();
        setAppointments(finalAppointments);
        
        toast.success(`Caricati ${loadedEmployees.length} dipendenti e ${finalAppointments.length} appuntamenti`);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        toast.error('Errore nel caricamento dei dati da Supabase');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Generate recurring appointments when date changes
  useEffect(() => {
    const generateRecurringForDate = async () => {
      try {
        const recurringTreatments = await loadRecurringTreatmentsFromSupabase();
        const startDate = subDays(selectedDate, 1);
        const endDate = addDays(selectedDate, 7);
        
        await generateAppointmentsForDateRange(recurringTreatments, startDate, endDate);
        
        // Reload appointments
        const updatedAppointments = await loadAppointmentsFromSupabase();
        setAppointments(updatedAppointments);
      } catch (error) {
        console.error('Errore nella generazione appuntamenti ricorrenti per data:', error);
      }
    };

    if (!isLoading) {
      generateRecurringForDate();
    }
  }, [selectedDate, isLoading]);

  return {
    appointments,
    employees,
    isLoading,
    setAppointments,
    setEmployees
  };
};
