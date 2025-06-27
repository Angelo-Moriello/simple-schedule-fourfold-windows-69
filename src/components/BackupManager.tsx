
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, Settings } from 'lucide-react';
import { useBackupSettings } from '@/hooks/useBackupSettings';
import ManualBackupCard from './backup-manager/ManualBackupCard';
import BackupSettingsCard from './backup-manager/BackupSettingsCard';
import RestoreBackupCard from './backup-manager/RestoreBackupCard';
import BackupInfoCard from './backup-manager/BackupInfoCard';
import BackupStatusInfo from './backup-manager/BackupStatusInfo';

const BackupManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    autoBackupEnabled,
    setAutoBackupEnabled,
    backupInterval,
    setBackupInterval,
    lastBackupTime,
    performBackup,
    handleRestore
  } = useBackupSettings();

  const handleManualBackup = () => {
    performBackup(false);
  };

  const handleRestoreFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleRestore(event);
    setIsOpen(false);
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
          <ManualBackupCard onBackup={handleManualBackup} />

          <BackupSettingsCard
            autoBackupEnabled={autoBackupEnabled}
            backupInterval={backupInterval}
            onAutoBackupToggle={setAutoBackupEnabled}
            onIntervalChange={setBackupInterval}
          />

          <BackupStatusInfo
            lastBackupTime={lastBackupTime}
            autoBackupEnabled={autoBackupEnabled}
          />

          <RestoreBackupCard onRestore={handleRestoreFile} />

          <BackupInfoCard />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackupManager;
