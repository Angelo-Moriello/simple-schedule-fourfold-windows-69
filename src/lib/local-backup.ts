
// Re-export all functions from the refactored modules
export { createBackup, getBackupHistory, getLastBackupTime } from './backup/backup-operations';
export { downloadBackupFile } from './backup/file-download';
export { setAutoBackupInterval, getAutoBackupInterval, initializeAutoBackup } from './backup/auto-backup';
export { isBrowserSupported } from './backup/browser-compatibility';
export type { BackupEntry, BackupData } from './backup/types';
