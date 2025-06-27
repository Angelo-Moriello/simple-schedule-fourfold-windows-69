interface BackupEntry {
  date: string;
  type: 'manual' | 'automatic';
}

interface BackupData {
  date: string;
  type: 'manual' | 'automatic';
  data: string;
}

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

    if (targetBackup) {
      const blob = new Blob([targetBackup.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${backup.date.replace(/[/:]/g, '-')}.json`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL object
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } else {
      throw new Error('Backup non trovato');
    }
  } catch (error) {
    console.error('Errore nel download backup:', error);
    throw new Error('Impossibile scaricare il backup');
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
    // Clear existing interval
    const existingInterval = localStorage.getItem('auto-backup-interval-id');
    if (existingInterval) {
      clearInterval(parseInt(existingInterval));
      localStorage.removeItem('auto-backup-interval-id');
    }

    if (hours && hours > 0) {
      localStorage.setItem('auto-backup-interval-hours', hours.toString());
      
      // Set up new interval
      const intervalId = setInterval(() => {
        createBackup('automatic').catch(error => {
          console.error('Errore nel backup automatico:', error);
        });
      }, hours * 60 * 60 * 1000); // Convert hours to milliseconds
      
      localStorage.setItem('auto-backup-interval-id', intervalId.toString());
    } else {
      localStorage.removeItem('auto-backup-interval-hours');
    }
  } catch (error) {
    console.error('Errore nella configurazione backup automatico:', error);
    throw new Error('Impossibile configurare il backup automatico');
  }
};

export const getAutoBackupInterval = async (): Promise<number | null> => {
  try {
    const hours = localStorage.getItem('auto-backup-interval-hours');
    return hours ? parseInt(hours) : null;
  } catch (error) {
    console.error('Errore nel recupero intervallo backup:', error);
    return null;
  }
};
