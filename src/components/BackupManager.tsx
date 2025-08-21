
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, Settings } from 'lucide-react';
import { useBackupManager } from '@/hooks/useBackupManager';
import BackupHistoryList from './backup/BackupHistoryList';
import AutoBackupSettings from './backup/AutoBackupSettings';
import CustomFileNameInput from './backup/CustomFileNameInput';
import BackupStatusDisplay from './backup/BackupStatusDisplay';
import ManualBackupButton from './backup/ManualBackupButton';
import ImportFileButton from './backup/ImportFileButton';
import ExportFolderButton from './backup/ExportFolderButton';

const BackupManager = () => {
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
    exportBackupToFolder,
    importBackupFromFile,
    restoreBackup,
    loadAllData
  } = useBackupManager();

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

            <ExportFolderButton
              onExportToFolder={exportBackupToFolder}
              disabled={browserError !== null}
            />

            <ImportFileButton
              onImportFile={importBackupFromFile}
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
            onRestore={restoreBackup}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackupManager;
