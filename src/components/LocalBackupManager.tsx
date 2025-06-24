
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HardDrive, Download, Settings, Clock, FolderOpen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface BackupFile {
  name: string;
  date: Date;
  size: number;
}

const LocalBackupManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupInterval, setBackupInterval] = useState('60'); // minutes
  const [lastBackupTime, setLastBackupTime] = useState<Date | null>(null);
  const [backupHistory, setBackupHistory] = useState<BackupFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  // Load backup settings from localStorage
  useEffect(() => {
    const settings = localStorage.getItem('localBackupSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setAutoBackupEnabled(parsed.autoBackupEnabled || false);
      setBackupInterval(parsed.backupInterval || '60');
      setSelectedFolder(parsed.selectedFolder || '');
    }

    const lastBackup = localStorage.getItem('lastLocalBackupTime');
    if (lastBackup) {
      setLastBackupTime(new Date(lastBackup));
    }

    // Load backup history from localStorage
    const history = localStorage.getItem('localBackupHistory');
    if (history) {
      const parsed = JSON.parse(history);
      setBackupHistory(parsed.map((item: any) => ({
        ...item,
        date: new Date(item.date)
      })));
    }
  }, []);

  // Save backup settings
  useEffect(() => {
    const settings = {
      autoBackupEnabled,
      backupInterval: parseInt(backupInterval),
      selectedFolder
    };
    localStorage.setItem('localBackupSettings', JSON.stringify(settings));
  }, [autoBackupEnabled, backupInterval, selectedFolder]);

  // Auto backup functionality
  useEffect(() => {
    if (!autoBackupEnabled) return;

    const intervalMs = parseInt(backupInterval) * 60 * 1000;
    const interval = setInterval(() => {
      performLocalBackup();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [autoBackupEnabled, backupInterval]);

  // Clean old backups (older than 30 days)
  useEffect(() => {
    const cleanOldBackups = () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filteredHistory = backupHistory.filter(backup => backup.date > thirtyDaysAgo);
      
      if (filteredHistory.length !== backupHistory.length) {
        setBackupHistory(filteredHistory);
        localStorage.setItem('localBackupHistory', JSON.stringify(filteredHistory));
        toast.info(`Rimossi ${backupHistory.length - filteredHistory.length} backup obsoleti`);
      }
    };

    cleanOldBackups();
    
    // Run cleanup daily
    const cleanupInterval = setInterval(cleanOldBackups, 24 * 60 * 60 * 1000);
    return () => clearInterval(cleanupInterval);
  }, [backupHistory]);

  const performLocalBackup = async () => {
    try {
      // Get data from localStorage (not Supabase to avoid conflicts)
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      const services = JSON.parse(localStorage.getItem('services') || '{}');
      
      const backupData = {
        appointments,
        employees,
        clients,
        services,
        exportDate: new Date().toISOString(),
        version: '1.1',
        source: 'local-backup-manager'
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const now = new Date();
      const fileName = `backup-locale-${format(now, 'yyyy-MM-dd-HH-mm-ss')}.json`;
      
      // Create download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      // Update backup history
      const newBackup: BackupFile = {
        name: fileName,
        date: now,
        size: blob.size
      };
      
      const updatedHistory = [newBackup, ...backupHistory];
      setBackupHistory(updatedHistory);
      localStorage.setItem('localBackupHistory', JSON.stringify(updatedHistory));
      
      setLastBackupTime(now);
      localStorage.setItem('lastLocalBackupTime', now.toISOString());
      
      toast.success('Backup locale completato con successo!');
    } catch (error) {
      console.error('Errore durante il backup locale:', error);
      toast.error('Errore durante il backup locale');
    }
  };

  const handleFolderSelect = () => {
    // Note: Modern browsers don't allow direct folder selection for security reasons
    // We'll show a helpful message instead
    toast.info('I file verranno scaricati nella cartella Download predefinita del browser. Per cambiarla, modifica le impostazioni del browser.');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeBackupFromHistory = (fileName: string) => {
    const updatedHistory = backupHistory.filter(backup => backup.name !== fileName);
    setBackupHistory(updatedHistory);
    localStorage.setItem('localBackupHistory', JSON.stringify(updatedHistory));
    toast.success('Backup rimosso dalla cronologia');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="h-11 px-4 rounded-full border-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <HardDrive className="h-5 w-5 mr-2" />
          <span className="font-medium">Backup</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestione Backup Locale
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
                Scarica immediatamente una copia locale di tutti i tuoi dati
              </p>
              <Button 
                onClick={performLocalBackup} 
                className="w-full h-11 rounded-full bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <HardDrive className="h-4 w-4 mr-2" />
                Scarica Backup Locale Ora
              </Button>
            </CardContent>
          </Card>

          {/* Auto Backup Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Backup Automatico Locale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-backup-local" className="text-sm">
                  Abilita backup automatico locale
                </Label>
                <Switch
                  id="auto-backup-local"
                  checked={autoBackupEnabled}
                  onCheckedChange={setAutoBackupEnabled}
                />
              </div>
              
              {autoBackupEnabled && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="interval-local" className="text-sm">
                      Frequenza backup (minuti)
                    </Label>
                    <Select value={backupInterval} onValueChange={setBackupInterval}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                      💡 I backup vengono automaticamente eliminati dopo 30 giorni
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Folder Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Cartella di Destinazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Configura dove salvare i file di backup
              </p>
              <Button 
                onClick={handleFolderSelect} 
                variant="outline" 
                className="w-full h-11 rounded-full border-2 hover:border-gray-400 transition-all duration-200"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Configura Cartella Download
              </Button>
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-xs text-amber-700">
                  ℹ️ I file vengono salvati nella cartella Download del browser. Per cambiarla, modifica le impostazioni del browser.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Backup History */}
          {backupHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cronologia Backup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {backupHistory.slice(0, 10).map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{backup.name}</span>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>{format(backup.date, 'dd/MM/yyyy HH:mm', { locale: it })}</span>
                          <span>{formatFileSize(backup.size)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBackupFromHistory(backup.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {backupHistory.length > 10 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Mostrati i primi 10 backup. Totale: {backupHistory.length}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informazioni Backup Locale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• I backup locali non interferiscono con Supabase</p>
                <p>• I file vengono scaricati direttamente sul tuo computer</p>
                <p>• Backup automatici ogni 30 giorni vengono eliminati</p>
                <p>• Include appuntamenti, dipendenti, clienti e servizi</p>
                <p>• Formato JSON compatibile con il sistema di ripristino</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocalBackupManager;
