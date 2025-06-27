
interface BackupEntry {
  date: string;
  type: 'manual' | 'automatic';
}

interface BackupData {
  date: string;
  type: 'manual' | 'automatic';
  data: string;
}

// Global variable to store the current interval ID
let currentAutoBackupInterval: NodeJS.Timeout | null = null;

// Simulate backup functionality using localStorage
export const createBackup = async (type: 'manual' | 'automatic'): Promise<void> => {
  try {
    const timestamp = new Date().toISOString();
    const backupData = {
      date: timestamp,
      type,
      data: {
        appointments: JSON.parse(localStorage.getItem('appointments') || '[]'),
        employees: JSON.parse(localStorage.getItem('employees') || '[]'),
        clients: JSON.parse(localStorage.getItem('clients') || '[]'),
        services: JSON.parse(localStorage.getItem('services') || '{}')
      }
    };

    // Store backup in localStorage
    const backups: BackupData[] = JSON.parse(localStorage.getItem('local-backups') || '[]');
    backups.push({
      date: timestamp,
      type,
      data: JSON.stringify(backupData)
    });

    // Keep only backups from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filteredBackups = backups.filter((backup: BackupData) => 
      new Date(backup.date) >= thirtyDaysAgo
    );

    localStorage.setItem('local-backups', JSON.stringify(filteredBackups));
    localStorage.setItem('last-backup-time', timestamp);
    
    console.log('Backup creato con successo:', type);
  } catch (error) {
    console.error('Errore nella creazione backup:', error);
    throw new Error('Impossibile creare il backup');
  }
};

export const getBackupHistory = async (): Promise<BackupEntry[]> => {
  try {
    const backups: BackupData[] = JSON.parse(localStorage.getItem('local-backups') || '[]');
    return backups.map((backup: BackupData) => ({
      date: new Date(backup.date).toLocaleString('it-IT'),
      type: backup.type
    }));
  } catch (error) {
    console.error('Errore nel recupero cronologia backup:', error);
    return [];
  }
};

export const downloadBackupFile = async (backup: BackupEntry): Promise<void> => {
  try {
    const backups: BackupData[] = JSON.parse(localStorage.getItem('local-backups') || '[]');
    const targetBackup = backups.find((b: BackupData) => 
      new Date(b.date).toLocaleString('it-IT') === backup.date && b.type === backup.type
    );

    if (!targetBackup) {
      throw new Error('Backup non trovato');
    }

    // Create and download file with better error handling
    const blob = new Blob([targetBackup.data], { type: 'application/json' });
    
    // Check if the browser supports URL.createObjectURL
    if (!window.URL || !window.URL.createObjectURL) {
      throw new Error('Browser non supportato per il download');
    }
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${backup.date.replace(/[/:, ]/g, '-')}.json`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL object after a delay
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Errore nella pulizia URL:', e);
      }
    }, 1000);
    
  } catch (error) {
    console.error('Errore nel download backup:', error);
    throw new Error('Impossibile scaricare il backup: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
  }
};

export const getLastBackupTime = async (): Promise<string | null> => {
  try {
    const lastBackup = localStorage.getItem('last-backup-time');
    return lastBackup ? new Date(lastBackup).toLocaleString('it-IT') : null;
  } catch (error) {
    console.error('Errore nel recupero ultimo backup:', error);
    return null;
  }
};

export const setAutoBackupInterval = (hours: number | null): void => {
  try {
    console.log('Configurazione backup automatico:', hours);
    
    // Clear existing interval
    if (currentAutoBackupInterval) {
      clearInterval(currentAutoBackupInterval);
      currentAutoBackupInterval = null;
      console.log('Intervallo precedente cancellato');
    }
    
    // Remove old localStorage interval tracking
    localStorage.removeItem('auto-backup-interval-id');

    if (hours && hours > 0 && hours <= 168) {
      localStorage.setItem('auto-backup-interval-hours', hours.toString());
      
      // Set up new interval with better error handling
      const intervalMs = hours * 60 * 60 * 1000; // Convert hours to milliseconds
      console.log('Impostazione intervallo ogni', intervalMs, 'ms');
      
      currentAutoBackupInterval = setInterval(async () => {
        try {
          console.log('Esecuzione backup automatico...');
          await createBackup('automatic');
          console.log('Backup automatico completato');
        } catch (error) {
          console.error('Errore nel backup automatico:', error);
        }
      }, intervalMs);
      
      console.log('Backup automatico configurato per ogni', hours, 'ore');
    } else {
      localStorage.removeItem('auto-backup-interval-hours');
      console.log('Backup automatico disabilitato');
    }
  } catch (error) {
    console.error('Errore nella configurazione backup automatico:', error);
    throw new Error('Impossibile configurare il backup automatico: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
  }
};

export const getAutoBackupInterval = async (): Promise<number | null> => {
  try {
    const hours = localStorage.getItem('auto-backup-interval-hours');
    const result = hours ? parseInt(hours, 10) : null;
    console.log('Intervallo backup recuperato:', result);
    return result;
  } catch (error) {
    console.error('Errore nel recupero intervallo backup:', error);
    return null;
  }
};

// Initialize auto backup on module load if previously configured
export const initializeAutoBackup = async (): Promise<void> => {
  try {
    const savedInterval = await getAutoBackupInterval();
    if (savedInterval) {
      console.log('Ripristino backup automatico:', savedInterval, 'ore');
      setAutoBackupInterval(savedInterval);
    }
  } catch (error) {
    console.error('Errore nell\'inizializzazione backup automatico:', error);
  }
};
