
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
    loadAllData
  };
};
