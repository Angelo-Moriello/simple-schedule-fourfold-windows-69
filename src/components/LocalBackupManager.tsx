
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useBackupManager } from '@/hooks/useBackupManager';
import BackupHistoryList from './backup/BackupHistoryList';
import AutoBackupSettings from './backup/AutoBackupSettings';
import CustomFileNameInput from './backup/CustomFileNameInput';
import BackupStatusDisplay from './backup/BackupStatusDisplay';
import ManualBackupButton from './backup/ManualBackupButton';

const LocalBackupManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    backupHistory,
    isCreatingBackup,
    lastBackup,
    autoBackupEnabled,
    backupInterval,
    isConfiguring,
    browserError,
    customFileName,
    setCustomFileName,
    handleAutoBackupToggle,
    handleIntervalChange,
    createManualBackup,
    downloadBackup,
    loadAllData
  } = useBackupManager();

  useEffect(() => {
    if (isOpen && !browserError) {
      loadAllData();
    }
  }, [isOpen, browserError, loadAllData]);

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
          
          <BackupStatusDisplay 
            lastBackup={null} 
            browserError={browserError} 
          />
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
          <BackupStatusDisplay 
            lastBackup={lastBackup} 
            browserError={browserError} 
          />

          <div className="space-y-3">
            <ManualBackupButton
              onCreateBackup={createManualBackup}
              isCreatingBackup={isCreatingBackup}
              disabled={browserError !== null}
            />

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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocalBackupManager;
