
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  createBackup,
  getBackupHistory,
  downloadBackupFile,
  getLastBackupTime,
  setAutoBackupInterval,
  getAutoBackupInterval,
  isBrowserSupported
} from '@/lib/local-backup';
import { BackupEntry } from '@/lib/backup/types';
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/backup/browser-compatibility';

export const useBackupManager = () => {
  const [backupHistory, setBackupHistory] = useState<BackupEntry[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupInterval, setBackupInterval] = useState(5/3600); // Default: 5 secondi
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [browserError, setBrowserError] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    try {
      if (!isBrowserSupported()) {
        setBrowserError('Il tuo browser non supporta tutte le funzionalità necessarie');
        return;
      }
      setBrowserError(null);
    } catch (error) {
      setBrowserError('Errore di compatibilità del browser');
      console.error('Browser compatibility error:', error);
    }
  }, []);

  const loadBackupHistory = async () => {
    if (browserError) return;
    try {
      const history = await getBackupHistory();
      setBackupHistory(history);
    } catch (error) {
      console.error('Errore nel caricamento cronologia backup:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nel caricamento della cronologia backup",
      });
    }
  };

  const loadLastBackupTime = async () => {
    if (browserError) return;
    try {
      const lastTime = await getLastBackupTime();
      setLastBackup(lastTime);
    } catch (error) {
      console.error('Errore nel caricamento ultimo backup:', error);
    }
  };

  const loadAutoBackupInterval = async () => {
    if (browserError) return;
    try {
      const interval = await getAutoBackupInterval();
      if (interval !== null && interval > 0) {
        setAutoBackupEnabled(true);
        setBackupInterval(interval);
      } else {
        setAutoBackupEnabled(false);
      }
    } catch (error) {
      console.error('Errore nel caricamento impostazioni auto backup:', error);
    }
  };

  const handleAutoBackupToggle = async (enabled: boolean) => {
    if (isConfiguring || browserError) return;
    
    setIsConfiguring(true);
    try {
      setAutoBackupEnabled(enabled);
      
      if (enabled) {
        await setAutoBackupInterval(backupInterval);
        const unit = backupInterval >= 1 ? 'ore' : 'secondi';
        const value = backupInterval >= 1 ? backupInterval : backupInterval * 3600;
        toast({
          title: "Backup Automatico Abilitato",
          description: `Backup ogni ${value} ${unit}`,
        });
      } else {
        await setAutoBackupInterval(null);
        toast({
          title: "Backup Automatico Disabilitato",
          description: "Il backup automatico è stato disattivato",
        });
      }
    } catch (error) {
      console.error('Errore nella configurazione backup automatico:', error);
      setAutoBackupEnabled(!enabled);
      toast({
        variant: "destructive",
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nella configurazione del backup automatico",
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleIntervalChange = async (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0 || browserError) {
      return;
    }
    
    setBackupInterval(numValue);
    
    if (autoBackupEnabled && !isConfiguring) {
      try {
        await setAutoBackupInterval(numValue);
        const unit = numValue >= 1 ? 'ore' : 'secondi';
        const displayValue = numValue >= 1 ? numValue : numValue * 3600;
        toast({
          title: "Intervallo Aggiornato",
          description: `Backup ogni ${displayValue} ${unit}`,
        });
      } catch (error) {
        console.error('Errore nell\'aggiornamento intervallo:', error);
        toast({
          variant: "destructive", 
          title: "Errore",
          description: error instanceof Error ? error.message : "Errore nell'aggiornamento dell'intervallo",
        });
      }
    }
  };

  const createManualBackup = async () => {
    if (isCreatingBackup || browserError) return;
    
    setIsCreatingBackup(true);
    try {
      await createBackup('manual');
      await loadBackupHistory();
      await loadLastBackupTime();
      toast({
        title: "Backup Manuale Creato",
        description: "Backup creato con successo (include appuntamenti, dipendenti, clienti, servizi, ferie, trattamenti ricorrenti e statistiche)",
      });
    } catch (error) {
      console.error('Errore nella creazione backup:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante la creazione del backup",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = async (backup: BackupEntry) => {
    try {
      if (browserError) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: browserError,
        });
        return;
      }
      
      const fileName = customFileName || undefined;
      await downloadBackupFile(backup, fileName);
      toast({
        title: "Download Backup",
        description: "Il download del backup è iniziato",
      });
    } catch (error) {
      console.error('Errore nel download backup:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante il download del backup",
      });
    }
  };

  const restoreBackup = async (backup: BackupEntry) => {
    try {
      const backups = JSON.parse(safeLocalStorageGet('local-backups', '[]')) as Array<{ date: string; type: string; data: string }>;
      const target = backups.find((b) => {
        const iso = (backup as any)?.iso as string | undefined;
        if (iso) return b.date === iso && b.type === backup.type;
        try {
          return new Date(b.date).toLocaleString('it-IT') === backup.date && b.type === backup.type;
        } catch {
          return false;
        }
      });
      if (!target) throw new Error('Backup non trovato');
      const parsed = JSON.parse(target.data);
      const payload = parsed?.data || parsed;

      // Ripristino solo i dati locali (non modifica le tabelle su Supabase)
      safeLocalStorageSet('services', JSON.stringify(payload.services ?? {}));
      safeLocalStorageSet('serviceCategories', JSON.stringify(payload.serviceCategories ?? []));
      safeLocalStorageSet('appSettings', JSON.stringify(payload.appSettings ?? {}));

      toast({
        title: 'Ripristino completato',
        description: 'Impostazioni locali ripristinate. I dati del database restano invariati.',
      });
    } catch (error) {
      console.error('Errore nel ripristino backup:', error);
      toast({
        variant: 'destructive',
        title: 'Errore ripristino',
        description: error instanceof Error ? error.message : 'Errore sconosciuto durante il ripristino',
      });
    }
  };

  const importBackupFromFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const dateIso = parsed?.date || new Date().toISOString();
      const type = (parsed?.type as 'manual' | 'automatic') || 'manual';

      const backups = JSON.parse(safeLocalStorageGet('local-backups', '[]')) as any[];
      backups.push({ date: dateIso, type, data: JSON.stringify(parsed) });
      const ok = safeLocalStorageSet('local-backups', JSON.stringify(backups));
      if (!ok) throw new Error('Impossibile salvare il backup importato');

      await loadBackupHistory();
      toast({ title: 'Backup importato', description: 'File aggiunto alla cronologia backup' });
    } catch (error) {
      console.error('Errore nell\'importazione backup:', error);
      toast({
        variant: 'destructive',
        title: 'Errore importazione',
        description: error instanceof Error ? error.message : 'File non valido',
      });
    }
  };

  const exportBackupToFolder = async () => {
    try {
      if (!(window as any).showDirectoryPicker) {
        throw new Error('Il tuo browser non supporta il salvataggio in cartella');
      }

      // Prima controlla se esistono backup, altrimenti prova a crearne uno nuovo
      let backups = JSON.parse(safeLocalStorageGet('local-backups', '[]')) as Array<{ date: string; type: string; data: string }>;
      
      if (backups.length === 0) {
        console.log('Nessun backup esistente, creo un nuovo backup...');
        try {
          await createBackup('manual');
          backups = JSON.parse(safeLocalStorageGet('local-backups', '[]')) as Array<{ date: string; type: string; data: string }>;
        } catch (backupError) {
          console.error('Errore nella creazione backup:', backupError);
          throw new Error('Impossibile creare un backup. Prova a liberare spazio o esporta i dati manualmente.');
        }
      }
      
      if (backups.length === 0) {
        throw new Error('Nessun backup disponibile per l\'esportazione');
      }

      // Prende l'ultimo backup per data
      const latest = backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      // Apre il dialog per scegliere la cartella
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      
      const defaultName = customFileName || `backup-${new Date(latest.date).toISOString().replace(/[:]/g, '-').split('T')[0]}.json`;
      const fileHandle = await (dirHandle as any).getFileHandle(defaultName, { create: true });
      const writable = await (fileHandle as any).createWritable();
      
      await writable.write(new Blob([latest.data], { type: 'application/json' }));
      await writable.close();

      toast({ 
        title: 'Backup salvato con successo!', 
        description: `File salvato come: ${defaultName}` 
      });
    } catch (error) {
      console.error('Errore nell\'esportazione su cartella:', error);
      
      let errorMessage = 'Errore sconosciuto durante il salvataggio';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Operazione annullata dall\'utente';
        } else if (error.message.includes('not supported')) {
          errorMessage = 'Funzione non supportata dal tuo browser. Usa Chrome o Edge aggiornati.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Errore esportazione',
        description: errorMessage,
      });
    }
  };

  const loadAllData = async () => {
    await loadBackupHistory();
    await loadLastBackupTime();
    await loadAutoBackupInterval();
  };

  return {
    // State
    backupHistory,
    isCreatingBackup,
    lastBackup,
    autoBackupEnabled,
    backupInterval,
    isConfiguring,
    browserError,
    customFileName,
    setCustomFileName,
    // Actions
    handleAutoBackupToggle,
    handleIntervalChange,
    createManualBackup,
    downloadBackup,
    exportBackupToFolder,
    importBackupFromFile,
    restoreBackup,
    loadAllData
  };
};
