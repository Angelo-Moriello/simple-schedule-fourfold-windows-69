
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
  const [backupInterval, setBackupInterval] = useState('30'); // minutes
  const [lastBackupTime, setLastBackupTime] = useState<Date | null>(null);

  // Load backup settings from localStorage
  useEffect(() => {
    const settings = localStorage.getItem('backupSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setAutoBackupEnabled(parsed.autoBackupEnabled || false);
      setBackupInterval(parsed.backupInterval || '30');
    }

    const lastBackup = localStorage.getItem('lastBackupTime');
    if (lastBackup) {
      setLastBackupTime(new Date(lastBackup));
    }
  }, []);

  // Save backup settings
  useEffect(() => {
    const settings = {
      autoBackupEnabled,
      backupInterval: parseInt(backupInterval)
    };
    localStorage.setItem('backupSettings', JSON.stringify(settings));
  }, [autoBackupEnabled, backupInterval]);

  // Auto backup functionality
  useEffect(() => {
    if (!autoBackupEnabled) return;

    const intervalMs = parseInt(backupInterval) * 60 * 1000; // Convert to milliseconds
    const interval = setInterval(() => {
      performBackup();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [autoBackupEnabled, backupInterval]);

  const performBackup = () => {
    try {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const services = JSON.parse(localStorage.getItem('services') || '{}');
      
      const backupData = {
        appointments,
        employees,
        services,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `backup-appuntamenti-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      setLastBackupTime(new Date());
      localStorage.setItem('lastBackupTime', new Date().toISOString());
      
      toast.success('Backup completato con successo!');
    } catch (error) {
      console.error('Errore durante il backup:', error);
      toast.error('Errore durante il backup');
    }
  };

  const handleManualBackup = () => {
    performBackup();
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        
        // Validate backup data structure
        if (!backupData.appointments || !backupData.employees) {
          toast.error('File di backup non valido');
          return;
        }

        // Restore data
        localStorage.setItem('appointments', JSON.stringify(backupData.appointments));
        localStorage.setItem('employees', JSON.stringify(backupData.employees));
        if (backupData.services) {
          localStorage.setItem('services', JSON.stringify(backupData.services));
        }

        toast.success('Backup ripristinato con successo! Ricarica la pagina per vedere i cambiamenti.');
        
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        console.error('Errore durante il ripristino:', error);
        toast.error('Errore durante il ripristino del backup');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
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
