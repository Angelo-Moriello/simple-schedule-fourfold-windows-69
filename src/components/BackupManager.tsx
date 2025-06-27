
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Save, Download, Upload, Settings, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const BackupManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupInterval, setBackupInterval] = useState('30');
  const [lastBackupTime, setLastBackupTime] = useState<Date | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Load backup settings from localStorage
  useEffect(() => {
    try {
      const settings = localStorage.getItem('backupSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setAutoBackupEnabled(parsed.autoBackupEnabled || false);
        setBackupInterval(parsed.backupInterval?.toString() || '30');
      }

      const lastBackup = localStorage.getItem('lastBackupTime');
      if (lastBackup) {
        setLastBackupTime(new Date(lastBackup));
      }
    } catch (error) {
      console.error('Errore nel caricamento delle impostazioni backup:', error);
    }
  }, []);

  // Save backup settings
  useEffect(() => {
    try {
      const settings = {
        autoBackupEnabled,
        backupInterval: parseInt(backupInterval)
      };
      localStorage.setItem('backupSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Errore nel salvataggio delle impostazioni backup:', error);
    }
  }, [autoBackupEnabled, backupInterval]);

  // Auto backup functionality
  useEffect(() => {
    // Clear existing interval
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    if (!autoBackupEnabled) return;

    try {
      const intervalMs = parseInt(backupInterval) * 60 * 1000;
      const newIntervalId = setInterval(() => {
        performBackup(true);
      }, intervalMs);
      
      setIntervalId(newIntervalId);
      
      return () => {
        if (newIntervalId) {
          clearInterval(newIntervalId);
        }
      };
    } catch (error) {
      console.error('Errore nella configurazione del backup automatico:', error);
      toast.error('Errore nella configurazione del backup automatico');
    }
  }, [autoBackupEnabled, backupInterval]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const performBackup = (isAutomatic = false) => {
    try {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const services = JSON.parse(localStorage.getItem('services') || '{}');
      
      const backupData = {
        appointments,
        employees,
        services,
        exportDate: new Date().toISOString(),
        version: '1.0',
        type: isAutomatic ? 'automatic' : 'manual'
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const exportFileDefaultName = `backup-appuntamenti-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.href = url;
      linkElement.download = exportFileDefaultName;
      linkElement.style.display = 'none';
      
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      
      // Clean up the URL object
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      const now = new Date();
      setLastBackupTime(now);
      localStorage.setItem('lastBackupTime', now.toISOString());
      
      toast.success(isAutomatic ? 'Backup automatico completato!' : 'Backup manuale completato!');
    } catch (error) {
      console.error('Errore durante il backup:', error);
      toast.error('Errore durante il backup: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  };

  const handleManualBackup = () => {
    performBackup(false);
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          toast.error('Errore nella lettura del file');
          return;
        }

        const backupData = JSON.parse(result);
        
        // Validate backup data structure
        if (!backupData.appointments || !backupData.employees) {
          toast.error('File di backup non valido - struttura dati mancante');
          return;
        }

        // Restore data
        localStorage.setItem('appointments', JSON.stringify(backupData.appointments));
        localStorage.setItem('employees', JSON.stringify(backupData.employees));
        if (backupData.services) {
          localStorage.setItem('services', JSON.stringify(backupData.services));
        }

        toast.success('Backup ripristinato con successo! La pagina verrà ricaricata.');
        
        // Close dialog and refresh after a short delay
        setIsOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
      } catch (error) {
        console.error('Errore durante il ripristino:', error);
        toast.error('Errore durante il ripristino: file non valido o corrotto');
      }
    };
    
    reader.onerror = () => {
      toast.error('Errore nella lettura del file');
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto h-10 sm:h-12 px-4 sm:px-6"
        >
          <Save className="h-4 w-4 mr-2" />
          Backup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestione Backup
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Manual Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" />
                Backup Manuale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Scarica immediatamente una copia di tutti i tuoi dati
              </p>
              <Button onClick={handleManualBackup} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Scarica Backup Ora
              </Button>
            </CardContent>
          </Card>

          {/* Auto Backup Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Backup Automatico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-backup" className="text-sm">
                  Abilita backup automatico
                </Label>
                <Switch
                  id="auto-backup"
                  checked={autoBackupEnabled}
                  onCheckedChange={setAutoBackupEnabled}
                />
              </div>
              
              {autoBackupEnabled && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="interval" className="text-sm">
                      Frequenza backup (minuti)
                    </Label>
                    <Select value={backupInterval} onValueChange={setBackupInterval}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Ogni 15 minuti</SelectItem>
                        <SelectItem value="30">Ogni 30 minuti</SelectItem>
                        <SelectItem value="60">Ogni ora</SelectItem>
                        <SelectItem value="120">Ogni 2 ore</SelectItem>
                        <SelectItem value="360">Ogni 6 ore</SelectItem>
                        <SelectItem value="720">Ogni 12 ore</SelectItem>
                        <SelectItem value="1440">Ogni giorno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {lastBackupTime && (
                    <p className="text-xs text-gray-500">
                      Ultimo backup: {format(lastBackupTime, 'dd/MM/yyyy alle HH:mm', { locale: it })}
                    </p>
                  )}
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-700">
                      💡 I file verranno scaricati automaticamente nella cartella Download del tuo browser
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Restore Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Ripristina Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Carica un file di backup per ripristinare i tuoi dati
              </p>
              <div className="space-y-2">
                <Label htmlFor="backup-file" className="text-sm">
                  Seleziona file di backup (.json)
                </Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  className="cursor-pointer"
                />
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-xs text-amber-700">
                  ⚠️ Il ripristino sovrascriverà tutti i dati attuali. Assicurati di aver fatto un backup prima di procedere.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Storage Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informazioni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• I backup includono appuntamenti, dipendenti e servizi</p>
                <p>• I file vengono salvati in formato JSON</p>
                <p>• È consigliabile effettuare backup regolari</p>
                <p>• I backup automatici vengono scaricati nella cartella Download</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackupManager;
