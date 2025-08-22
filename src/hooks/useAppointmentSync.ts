import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { 
  syncAppointmentsData, 
  updateLocalCache, 
  forceDataRefresh,
  validateDataConsistency,
  backupCacheToStorage,
  restoreCacheFromBackup
} from '@/utils/appointment/dataSync';

export const useAppointmentSync = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Caricamento iniziale con protezione anti-perdita
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await syncAppointmentsData(true);
      
      if (result.success && result.data) {
        const isValid = validateDataConsistency(result.data);
        if (isValid) {
          setAppointments(result.data);
          setLastSyncTime(new Date());
          backupCacheToStorage(); // Backup di sicurezza
        } else {
          console.warn('⚠️ Problemi di consistenza nei dati, tentativo di riparazione...');
          // Tenta di pulire i dati duplicati
          const cleanedData = result.data.filter((apt, index, arr) => 
            arr.findIndex(a => a.id === apt.id) === index
          );
          setAppointments(cleanedData);
          setLastSyncTime(new Date());
          backupCacheToStorage();
        }
      } else {
        // Tentativo di ripristino da backup
        const backupData = restoreCacheFromBackup();
        if (backupData.length > 0) {
          setAppointments(backupData);
          setLastSyncTime(new Date());
          toast.warning('Dati ripristinati da backup locale');
        } else {
          console.error('❌ Errore nel caricamento iniziale:', result.error);
          toast.error('Errore nel caricamento dei dati');
        }
      }
    } catch (error) {
      console.error('❌ Errore critico nel caricamento:', error);
      
      // Ultimo tentativo: ripristino da backup
      const backupData = restoreCacheFromBackup();
      if (backupData.length > 0) {
        setAppointments(backupData);
        setLastSyncTime(new Date());
        toast.warning('Dati ripristinati da backup di emergenza');
      } else {
        toast.error('Errore critico nel caricamento dati');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sincronizzazione periodica automatica con backup
  useEffect(() => {
    loadInitialData();

    // Sync automatico ridotto a 30 secondi per evitare conflitti con realtime
    const syncIntervalId = setInterval(async () => {
      try {
        const result = await syncAppointmentsData(false);
        if (result.success && result.data) {
          setAppointments(result.data);
          setLastSyncTime(new Date());
        }
      } catch (error) {
        console.warn('⚠️ Errore sincronizzazione automatica:', error);
      }
    }, 30000); // Cambiato da 15000 a 30000

    // Backup automatico ogni 60 secondi
    const backupIntervalId = setInterval(() => {
      backupCacheToStorage();
    }, 60000);

    return () => {
      clearInterval(syncIntervalId);
      clearInterval(backupIntervalId);
    };
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
    
    // Backup immediato dopo ogni modifica importante
    setTimeout(() => backupCacheToStorage(), 100);
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