
import { BackupData } from './types';
import { safeLocalStorageGet, safeLocalStorageSet, isBrowserSupported } from './browser-compatibility';

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
        services: JSON.parse(safeLocalStorageGet('services', '{}')),
        recurringTreatments: JSON.parse(safeLocalStorageGet('recurringTreatments')),
        vacations: JSON.parse(safeLocalStorageGet('vacations'))
      }
    };

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
    console.log('Backup creato con successo:', type, 'con dati:', Object.keys(backupData.data));
  } catch (error) {
    console.error('Errore nella creazione backup:', error);
    throw new Error('Impossibile creare il backup: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
  }
};

export const getBackupHistory = async () => {
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
