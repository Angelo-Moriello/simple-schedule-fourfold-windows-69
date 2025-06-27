
import { BackupData } from './types';
import { safeLocalStorageGet, safeLocalStorageSet, isBrowserSupported } from './browser-compatibility';

export const createBackup = async (type: 'manual' | 'automatic'): Promise<void> => {
  try {
    if (!isBrowserSupported()) {
      throw new Error('Browser non supportato per i backup');
    }

    const timestamp = new Date().toISOString();
    
    // Collect all data from localStorage and Supabase data
    const backupData = {
      date: timestamp,
      type,
      data: {
        // Appuntamenti
        appointments: JSON.parse(safeLocalStorageGet('appointments', '[]')),
        // Dipendenti (incluse le ferie)
        employees: JSON.parse(safeLocalStorageGet('employees', '[]')),
        // Clienti
        clients: JSON.parse(safeLocalStorageGet('clients', '[]')),
        // Servizi
        services: JSON.parse(safeLocalStorageGet('services', '{}')),
        // Trattamenti ricorrenti (attività/storico)
        recurringTreatments: JSON.parse(safeLocalStorageGet('recurringTreatments', '[]')),
        // Ferie (separate dai dipendenti per compatibilità legacy)
        vacations: JSON.parse(safeLocalStorageGet('vacations', '[]')),
        // Statistiche (se presenti)
        statistics: JSON.parse(safeLocalStorageGet('statistics', '{}')),
        // Storico appuntamenti (se presente)
        appointmentHistory: JSON.parse(safeLocalStorageGet('appointmentHistory', '[]')),
        // Impostazioni dell'app
        appSettings: JSON.parse(safeLocalStorageGet('appSettings', '{}')),
        // Categorie servizi
        serviceCategories: JSON.parse(safeLocalStorageGet('serviceCategories', '[]')),
        // Metadati del backup
        metadata: {
          version: '2.0',
          created: timestamp,
          type: type,
          dataTypes: ['appointments', 'employees', 'clients', 'services', 'recurringTreatments', 'vacations', 'statistics', 'appointmentHistory']
        }
      }
    };

    const backups: BackupData[] = JSON.parse(safeLocalStorageGet('local-backups', '[]'));
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
    console.log('Dettagli backup - Clienti:', backupData.data.clients?.length || 0, 'Appuntamenti:', backupData.data.appointments?.length || 0);
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
