import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast"
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
import BackupHistoryList from './backup/BackupHistoryList';
import AutoBackupSettings from './backup/AutoBackupSettings';
import CustomFileNameInput from './backup/CustomFileNameInput';

const LocalBackupManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupEntry[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupInterval, setBackupInterval] = useState(5/3600); // Default: 5 secondi
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [browserError, setBrowserError] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const { toast } = useToast()

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

  useEffect(() => {
    if (isOpen && !browserError) {
      loadBackupHistory();
      loadLastBackupTime();
      loadAutoBackupInterval();
    }
  }, [isOpen, browserError]);

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
      })
    } catch (error) {
      console.error('Errore nella creazione backup:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante la creazione del backup",
      })
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
      })
    } catch (error) {
      console.error('Errore nel download backup:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante il download del backup",
      })
    }
  };

  if (browserError) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="h-11 px-4 rounded-full border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span className="text-lg mr-2">⚠️</span>
            <span className="font-medium">Backup</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              Errore Browser
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <span className="text-base mr-1">❌</span>
                {browserError}
              </p>
              <p className="text-xs text-red-600 mt-2">
                Prova ad aggiornare il browser o utilizzare un browser diverso (Firefox, Edge, Safari).
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="h-11 px-4 rounded-full border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span className="text-lg mr-2">💾</span>
          <span className="font-medium">Backup</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">💾</span>
            Backup Locale
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="text-base mr-1">ℹ️</span>
              I backup includono: appuntamenti, dipendenti, clienti, servizi, ferie, trattamenti ricorrenti, storico e statistiche. Vengono eliminati automaticamente dopo 30 giorni.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={createManualBackup}
              disabled={isCreatingBackup}
              className="w-full h-11 rounded-full bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="text-lg mr-2">📤</span>
              {isCreatingBackup ? 'Creazione backup...' : 'Backup Manuale'}
            </Button>

            <AutoBackupSettings
              autoBackupEnabled={autoBackupEnabled}
              backupInterval={backupInterval}
              isConfiguring={isConfiguring}
              onToggle={handleAutoBackupToggle}
              onIntervalChange={handleIntervalChange}
            />

            <CustomFileNameInput
              customFileName={customFileName}
              onChange={setCustomFileName}
            />
          </div>

          <BackupHistoryList
            backupHistory={backupHistory}
            onDownload={downloadBackup}
          />

          {lastBackup && (
            <div className="text-xs text-gray-500 text-center bg-gray-50 p-2 rounded">
              <span className="mr-1">🕐</span>
              Ultimo backup: {lastBackup}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocalBackupManager;
