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

// Browser compatibility check
const isBrowserSupported = (): boolean => {
  try {
    return typeof localStorage !== 'undefined' && 
           typeof setInterval !== 'undefined' && 
           typeof clearInterval !== 'undefined';
  } catch (error) {
    console.error('Browser compatibility check failed:', error);
    return false;
  }
};

const safeLocalStorageGet = (key: string, fallback: string = '[]'): string => {
  try {
    if (!isBrowserSupported()) return fallback;
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    console.error(`Error accessing localStorage for key ${key}:`, error);
    return fallback;
  }
};

const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    if (!isBrowserSupported()) return false;
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting localStorage for key ${key}:`, error);
    return false;
  }
};

// Simulate backup functionality using localStorage
export const createBackup = async (type: 'manual' | 'automatic'): Promise<void> => {
  try {
    if (!isBrowserSupported()) {
      throw new Error('Browser non supportato per i backup');
    }

    const timestamp = new Date().toISOString();
    const backupData = {
      date: timestamp,
      type,
      data: {
        appointments: JSON.parse(safeLocalStorageGet('appointments')),
        employees: JSON.parse(safeLocalStorageGet('employees')),
        clients: JSON.parse(safeLocalStorageGet('clients')),
        services: JSON.parse(safeLocalStorageGet('services', '{}'))
      }
    };

    // Store backup in localStorage with enhanced error handling
    const backups: BackupData[] = JSON.parse(safeLocalStorageGet('local-backups'));
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

    const success = safeLocalStorageSet('local-backups', JSON.stringify(filteredBackups));
    if (!success) {
      throw new Error('Impossibile salvare il backup');
    }

    safeLocalStorageSet('last-backup-time', timestamp);
    
    console.log('Backup creato con successo:', type);
  } catch (error) {
    console.error('Errore nella creazione backup:', error);
    throw new Error('Impossibile creare il backup: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
  }
};

export const getBackupHistory = async (): Promise<BackupEntry[]> => {
  try {
    if (!isBrowserSupported()) {
      return [];
    }
    
    const backups: BackupData[] = JSON.parse(safeLocalStorageGet('local-backups'));
    return backups.map((backup: BackupData) => ({
      date: new Date(backup.date).toLocaleString('it-IT'),
      type: backup.type
    }));
  } catch (error) {
    console.error('Errore nel recupero cronologia backup:', error);
    return [];
  }
};

export const downloadBackupFile = async (backup: BackupEntry, customPath?: string): Promise<void> => {
  try {
    if (!isBrowserSupported()) {
      throw new Error('Browser non supportato per il download');
    }

    const backups: BackupData[] = JSON.parse(safeLocalStorageGet('local-backups'));
    const targetBackup = backups.find((b: BackupData) => 
      new Date(b.date).toLocaleString('it-IT') === backup.date && b.type === backup.type
    );

    if (!targetBackup) {
      throw new Error('Backup non trovato');
    }

    // Enhanced browser compatibility checks for download
    if (!window.URL || !window.URL.createObjectURL) {
      throw new Error('Browser non supportato per il download dei file');
    }

    if (!document.createElement) {
      throw new Error('DOM non disponibile per il download');
    }

    // Create and download file with better error handling
    const blob = new Blob([targetBackup.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const fileName = customPath || `backup-${backup.date.replace(/[/:, ]/g, '-')}.json`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    // Chrome-specific fix: ensure element is in DOM before clicking
    document.body.appendChild(a);
    
    // Use setTimeout to ensure DOM updates complete
    setTimeout(() => {
      try {
        a.click();
        // Clean up immediately after click
        setTimeout(() => {
          try {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (cleanupError) {
            console.warn('Errore nella pulizia:', cleanupError);
          }
        }, 100);
      } catch (clickError) {
        console.error('Errore nel click del download:', clickError);
        // Fallback: try to trigger download differently
        window.open(url, '_blank');
        setTimeout(() => {
          try {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (cleanupError) {
            console.warn('Errore nella pulizia fallback:', cleanupError);
          }
        }, 1000);
      }
    }, 10);
    
  } catch (error) {
    console.error('Errore nel download backup:', error);
    throw new Error('Impossibile scaricare il backup: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
  }
};

export const getLastBackupTime = async (): Promise<string | null> => {
  try {
    if (!isBrowserSupported()) {
      return null;
    }
    
    const lastBackup = safeLocalStorageGet('last-backup-time', '');
    return lastBackup ? new Date(lastBackup).toLocaleString('it-IT') : null;
  } catch (error) {
    console.error('Errore nel recupero ultimo backup:', error);
    return null;
  }
};

export const setAutoBackupInterval = (hours: number | null): void => {
  try {
    if (!isBrowserSupported()) {
      throw new Error('Browser non supportato per il backup automatico');
    }

    console.log('Configurazione backup automatico:', hours);
    
    // Clear existing interval with enhanced error handling
    if (currentAutoBackupInterval) {
      try {
        clearInterval(currentAutoBackupInterval);
        currentAutoBackupInterval = null;
        console.log('Intervallo precedente cancellato');
      } catch (clearError) {
        console.warn('Errore nella cancellazione intervallo:', clearError);
        currentAutoBackupInterval = null;
      }
    }

    if (hours && hours > 0) {
      const success = safeLocalStorageSet('auto-backup-interval-hours', hours.toString());
      if (!success) {
        throw new Error('Impossibile salvare le impostazioni di backup automatico');
      }
      
      // Set up new interval with Chrome-specific handling
      const intervalMs = hours >= 1 ? hours * 60 * 60 * 1000 : hours * 1000;
      console.log('Impostazione intervallo ogni', intervalMs, 'ms');
      
      try {
        currentAutoBackupInterval = setInterval(async () => {
          try {
            console.log('Esecuzione backup automatico...');
            await createBackup('automatic');
            console.log('Backup automatico completato');
          } catch (error) {
            console.error('Errore nel backup automatico:', error);
          }
        }, intervalMs);
        
        console.log('Backup automatico configurato per ogni', hours, hours >= 1 ? 'ore' : 'secondi');
      } catch (intervalError) {
        console.error('Errore nella creazione intervallo:', intervalError);
        throw new Error('Impossibile configurare l\'intervallo di backup automatico');
      }
    } else {
      safeLocalStorageSet('auto-backup-interval-hours', '');
      console.log('Backup automatico disabilitato');
    }
  } catch (error) {
    console.error('Errore nella configurazione backup automatico:', error);
    throw new Error('Impossibile configurare il backup automatico: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
  }
};

export const getAutoBackupInterval = async (): Promise<number | null> => {
  try {
    if (!isBrowserSupported()) {
      return null;
    }
    
    const hours = safeLocalStorageGet('auto-backup-interval-hours', '');
    const result = hours && hours !== '' ? parseInt(hours, 10) : null;
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
    if (!isBrowserSupported()) {
      console.warn('Browser non supportato per l\'inizializzazione backup automatico');
      return;
    }
    
    const savedInterval = await getAutoBackupInterval();
    if (savedInterval) {
      console.log('Ripristino backup automatico:', savedInterval, 'ore');
      setAutoBackupInterval(savedInterval);
    }
  } catch (error) {
    console.error('Errore nell\'inizializzazione backup automatico:', error);
  }
};
