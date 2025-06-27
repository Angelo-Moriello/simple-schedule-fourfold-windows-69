
import { BackupData } from './types';
import { safeLocalStorageGet, safeLocalStorageSet, isBrowserSupported } from './browser-compatibility';
import { supabase } from '@/integrations/supabase/client';

export const createBackup = async (type: 'manual' | 'automatic'): Promise<void> => {
  try {
    if (!isBrowserSupported()) {
      throw new Error('Browser non supportato per i backup');
    }

    const timestamp = new Date().toISOString();
    
    console.log('Inizio creazione backup - caricamento dati da Supabase...');
    
    // Carica tutti i dati da Supabase
    const [appointmentsResult, employeesResult, clientsResult, recurringTreatmentsResult] = await Promise.all([
      supabase.from('appointments').select('*'),
      supabase.from('employees').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('recurring_treatments').select('*')
    ]);

    console.log('Dati caricati:', {
      appointments: appointmentsResult.data?.length || 0,
      employees: employeesResult.data?.length || 0,
      clients: clientsResult.data?.length || 0,
      recurringTreatments: recurringTreatmentsResult.data?.length || 0
    });

    // Collect all data from Supabase and localStorage
    const backupData = {
      date: timestamp,
      type,
      data: {
        // Appuntamenti da Supabase
        appointments: appointmentsResult.data || [],
        // Dipendenti da Supabase (incluse le ferie)
        employees: employeesResult.data || [],
        // Clienti da Supabase
        clients: clientsResult.data || [],
        // Servizi (da localStorage per ora)
        services: JSON.parse(safeLocalStorageGet('services', '{}')),
        // Trattamenti ricorrenti da Supabase
        recurringTreatments: recurringTreatmentsResult.data || [],
        // Ferie (estratte dai dipendenti per compatibilità legacy)
        vacations: (employeesResult.data || []).reduce((acc: any[], employee: any) => {
          if (employee.vacations && employee.vacations.length > 0) {
            acc.push(...employee.vacations.map((vacation: string) => ({
              employeeId: employee.id,
              employeeName: employee.name,
              date: vacation
            })));
          }
          return acc;
        }, []),
        // Statistiche (calcolate dai dati)
        statistics: {
          totalAppointments: appointmentsResult.data?.length || 0,
          totalClients: clientsResult.data?.length || 0,
          totalEmployees: employeesResult.data?.length || 0,
          totalRecurringTreatments: recurringTreatmentsResult.data?.length || 0
        },
        // Storico appuntamenti (tutti gli appuntamenti sono lo storico)
        appointmentHistory: appointmentsResult.data || [],
        // Impostazioni dell'app (da localStorage)
        appSettings: JSON.parse(safeLocalStorageGet('appSettings', '{}')),
        // Categorie servizi (da localStorage)
        serviceCategories: JSON.parse(safeLocalStorageGet('serviceCategories', '[]')),
        // Metadati del backup
        metadata: {
          version: '2.0',
          created: timestamp,
          type: type,
          source: 'supabase',
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
    
    const backups: BackupData[] = JSON.parse(safeLocalStorageGet('local-backups', '[]'));
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
