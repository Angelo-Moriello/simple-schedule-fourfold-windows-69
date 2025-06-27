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
  getAutoBackupInterval
} from '@/lib/local-backup';

interface BackupEntry {
  date: string;
  type: 'manual' | 'automatic';
}

const LocalBackupManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupEntry[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupInterval, setBackupInterval] = useState(8);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { toast } = useToast()

  const loadBackupHistory = async () => {
    try {
      const history = await getBackupHistory();
      setBackupHistory(history);
    } catch (error) {
      console.error('Errore nel caricamento cronologia backup:', error);
    }
  };

  const loadLastBackupTime = async () => {
    try {
      const lastTime = await getLastBackupTime();
      setLastBackup(lastTime);
    } catch (error) {
      console.error('Errore nel caricamento ultimo backup:', error);
    }
  };

  const loadAutoBackupInterval = async () => {
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
    if (isOpen) {
      loadBackupHistory();
      loadLastBackupTime();
      loadAutoBackupInterval();
    }
  }, [isOpen]);

  const handleAutoBackupToggle = async (enabled: boolean) => {
    if (isConfiguring) return;
    
    setIsConfiguring(true);
    try {
      setAutoBackupEnabled(enabled);
      
      if (enabled) {
        await setAutoBackupInterval(backupInterval);
        toast({
          title: "Backup Automatico Abilitato",
          description: `Backup ogni ${backupInterval} ore`,
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
      setAutoBackupEnabled(!enabled); // Revert state
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nella configurazione del backup automatico",
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleIntervalChange = async (value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue <= 0 || numValue > 168) {
      return;
    }
    
    setBackupInterval(numValue);
    
    // If auto backup is enabled, update the interval immediately
    if (autoBackupEnabled && !isConfiguring) {
      try {
        await setAutoBackupInterval(numValue);
        toast({
          title: "Intervallo Aggiornato",
          description: `Backup ogni ${numValue} ore`,
        });
      } catch (error) {
        console.error('Errore nell\'aggiornamento intervallo:', error);
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Errore nell'aggiornamento dell'intervallo",
        });
      }
    }
  };

  const createManualBackup = async () => {
    if (isCreatingBackup) return;
    
    setIsCreatingBackup(true);
    try {
      await createBackup('manual');
      await loadBackupHistory();
      await loadLastBackupTime();
      toast({
        title: "Backup Manuale Creato",
        description: "Backup creato con successo",
      })
    } catch (error) {
      console.error('Errore nella creazione backup:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante la creazione del backup",
      })
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = async (backup: BackupEntry) => {
    try {
      await downloadBackupFile(backup);
      toast({
        title: "Download Backup",
        description: "Il download del backup è iniziato",
      })
    } catch (error) {
      console.error('Errore nel download backup:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante il download del backup",
      })
    }
  };

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
              I backup vengono salvati localmente e non interferiscono con Supabase.
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

            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <span className="text-base">⚙️</span>
                  Backup Automatico
                </span>
                <div className="flex items-center space-x-2">
                  <label htmlFor="auto-backup" className="text-sm">
                    {autoBackupEnabled ? '🟢' : '🔴'}
                  </label>
                  <input
                    id="auto-backup"
                    type="checkbox"
                    checked={autoBackupEnabled}
                    onChange={(e) => handleAutoBackupToggle(e.target.checked)}
                    disabled={isConfiguring}
                    className="rounded"
                  />
                  {isConfiguring && <span className="text-xs">⏳</span>}
                </div>
              </div>
              
              {autoBackupEnabled && (
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <span className="text-sm">⏰</span>
                    Intervallo (ore)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={backupInterval}
                    onChange={(e) => handleIntervalChange(e.target.value)}
                    disabled={isConfiguring}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {backupHistory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <span className="text-base">📋</span>
                Cronologia Backup ({backupHistory.length})
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {backupHistory.map((backup, index) => (
                  <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                    <span className="flex items-center gap-1">
                      <span className="text-sm">{backup.type === 'manual' ? '👆' : '🤖'}</span>
                      {backup.date}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadBackup(backup)}
                      className="h-6 w-6 p-0 rounded-full hover:bg-gray-200"
                    >
                      <span className="text-xs">⬇️</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
