import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { 
  syncAppointmentsData, 
  updateLocalCache, 
  forceDataRefresh,
  validateDataConsistency
} from '@/utils/appointment/dataSync';

export const useAppointmentSync = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Caricamento iniziale sicuro
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await syncAppointmentsData(true);
      
      if (result.success && result.data) {
        const isValid = validateDataConsistency(result.data);
        if (isValid) {
          setAppointments(result.data);
          setLastSyncTime(new Date());
          console.log('✅ Dati iniziali caricati con successo:', result.data.length);
        } else {
          console.warn('⚠️ Problemi di consistenza nei dati, tentativo di riparazione...');
          // Tenta di pulire i dati duplicati
          const cleanedData = result.data.filter((apt, index, arr) => 
            arr.findIndex(a => a.id === apt.id) === index
          );
          setAppointments(cleanedData);
          setLastSyncTime(new Date());
        }
      } else {
        console.error('❌ Errore nel caricamento iniziale:', result.error);
        toast.error('Errore nel caricamento dei dati');
      }
    } catch (error) {
      console.error('❌ Errore critico nel caricamento:', error);
      toast.error('Errore critico nel caricamento dati');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sincronizzazione periodica automatica
  useEffect(() => {
    loadInitialData();

    // Sync automatico ogni 30 secondi per mantenere dati aggiornati
    const intervalId = setInterval(async () => {
      try {
        const result = await syncAppointmentsData(false);
        if (result.success && result.data) {
          setAppointments(result.data);
          setLastSyncTime(new Date());
          console.log('🔄 Sincronizzazione automatica completata');
        }
      } catch (error) {
        console.warn('⚠️ Errore sincronizzazione automatica:', error);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [loadInitialData]);

  // Aggiorna appuntamento con sincronizzazione
  const updateAppointmentSync = useCallback((appointment: Appointment, operation: 'add' | 'update' | 'delete') => {
    // Aggiorna immediatamente lo stato locale per UI responsiva
    setAppointments(prev => {
      let newAppointments: Appointment[];
      
      switch (operation) {
        case 'add':
          newAppointments = prev.some(apt => apt.id === appointment.id) 
            ? prev 
            : [...prev, appointment];
          break;
        case 'update':
          newAppointments = prev.map(apt => 
            apt.id === appointment.id ? appointment : apt
          );
          break;
        case 'delete':
          newAppointments = prev.filter(apt => apt.id !== appointment.id);
          break;
        default:
          newAppointments = prev;
      }
      
      // Aggiorna anche la cache
      updateLocalCache(operation, appointment);
      
      return newAppointments;
    });
    
    setLastSyncTime(new Date());
  }, []);

  // Refresh manuale con feedback
  const refreshData = useCallback(async () => {
    try {
      console.log('🔄 Refresh manuale richiesto...');
      const result = await forceDataRefresh();
      
      if (result.success && result.data) {
        setAppointments(result.data);
        setLastSyncTime(new Date());
        toast.success(`Dati aggiornati: ${result.data.length} appuntamenti`);
        console.log('✅ Refresh manuale completato');
      } else {
        toast.error('Errore nel refresh dei dati');
      }
    } catch (error) {
      console.error('❌ Errore nel refresh manuale:', error);
      toast.error('Errore nel refresh dei dati');
    }
  }, []);

  // Conteggio appuntamenti per dipendente in una data specifica
  const getEmployeeAppointmentCount = useCallback((employeeId: number, date: string): number => {
    return appointments.filter(apt => 
      apt.employeeId === employeeId && apt.date === date
    ).length;
  }, [appointments]);

  // Ottieni appuntamenti per dipendente e data
  const getEmployeeAppointments = useCallback((employeeId: number, date: string): Appointment[] => {
    return appointments.filter(apt => 
      apt.employeeId === employeeId && apt.date === date
    );
  }, [appointments]);

  return {
    appointments,
    isLoading,
    lastSyncTime,
    updateAppointmentSync,
    refreshData,
    getEmployeeAppointmentCount,
    getEmployeeAppointments,
    reloadData: loadInitialData
  };
};