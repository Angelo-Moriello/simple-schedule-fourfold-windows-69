
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const useBackupSettings = () => {
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupInterval, setBackupInterval] = useState('30');
  const [lastBackupTime, setLastBackupTime] = useState<Date | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Load backup settings from localStorage
  useEffect(() => {
    try {
      const settings = localStorage.getItem('backupSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setAutoBackupEnabled(parsed.autoBackupEnabled || false);
        setBackupInterval(parsed.backupInterval?.toString() || '30');
      }

      const lastBackup = localStorage.getItem('lastBackupTime');
      if (lastBackup) {
        setLastBackupTime(new Date(lastBackup));
      }
    } catch (error) {
      console.error('Errore nel caricamento delle impostazioni backup:', error);
    }
  }, []);

  // Save backup settings
  useEffect(() => {
    try {
      const settings = {
        autoBackupEnabled,
        backupInterval: parseInt(backupInterval)
      };
      localStorage.setItem('backupSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Errore nel salvataggio delle impostazioni backup:', error);
    }
  }, [autoBackupEnabled, backupInterval]);

  const performBackup = (isAutomatic = false) => {
    try {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const services = JSON.parse(localStorage.getItem('services') || '{}');
      
      const backupData = {
        appointments,
        employees,
        services,
        exportDate: new Date().toISOString(),
        version: '1.0',
        type: isAutomatic ? 'automatic' : 'manual'
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const exportFileDefaultName = `backup-appuntamenti-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.href = url;
      linkElement.download = exportFileDefaultName;
      linkElement.style.display = 'none';
      
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      
      // Clean up the URL object
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      const now = new Date();
      setLastBackupTime(now);
      localStorage.setItem('lastBackupTime', now.toISOString());
      
      toast.success(isAutomatic ? 'Backup automatico completato!' : 'Backup manuale completato!');
    } catch (error) {
      console.error('Errore durante il backup:', error);
      toast.error('Errore durante il backup: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          toast.error('Errore nella lettura del file');
          return;
        }

        const backupData = JSON.parse(result);
        
        // Validate backup data structure
        if (!backupData.appointments || !backupData.employees) {
          toast.error('File di backup non valido - struttura dati mancante');
          return;
        }

        // Restore data
        localStorage.setItem('appointments', JSON.stringify(backupData.appointments));
        localStorage.setItem('employees', JSON.stringify(backupData.employees));
        if (backupData.services) {
          localStorage.setItem('services', JSON.stringify(backupData.services));
        }

        toast.success('Backup ripristinato con successo! La pagina verrà ricaricata.');
        
        // Refresh after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
      } catch (error) {
        console.error('Errore durante il ripristino:', error);
        toast.error('Errore durante il ripristino: file non valido o corrotto');
      }
    };
    
    reader.onerror = () => {
      toast.error('Errore nella lettura del file');
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  // Auto backup functionality
  useEffect(() => {
    // Clear existing interval
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    if (!autoBackupEnabled) return;

    try {
      const intervalMs = parseInt(backupInterval) * 60 * 1000;
      const newIntervalId = setInterval(() => {
        performBackup(true);
      }, intervalMs);
      
      setIntervalId(newIntervalId);
      
      return () => {
        if (newIntervalId) {
          clearInterval(newIntervalId);
        }
      };
    } catch (error) {
      console.error('Errore nella configurazione del backup automatico:', error);
      toast.error('Errore nella configurazione del backup automatico');
    }
  }, [autoBackupEnabled, backupInterval]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return {
    autoBackupEnabled,
    setAutoBackupEnabled,
    backupInterval,
    setBackupInterval,
    lastBackupTime,
    performBackup,
    handleRestore
  };
};
