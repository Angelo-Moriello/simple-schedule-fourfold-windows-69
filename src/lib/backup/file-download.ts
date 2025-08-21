
import { BackupEntry, BackupData } from './types';
import { safeLocalStorageGet, isBrowserSupported } from './browser-compatibility';

export const downloadBackupFile = async (backup: BackupEntry, customPath?: string): Promise<void> => {
  try {
    if (!isBrowserSupported()) {
      throw new Error('Browser non supportato per il download');
    }

    const backups: BackupData[] = JSON.parse(safeLocalStorageGet('local-backups'));
    const targetBackup = backups.find((b: BackupData) => {
      const iso = (backup as any)?.iso as string | undefined;
      if (iso) {
        return b.date === iso && b.type === backup.type;
      }
      // Fallback confronto su stringa localizzata
      try {
        return new Date(b.date).toLocaleString('it-IT') === backup.date && b.type === backup.type;
      } catch {
        return false;
      }
    });
    if (!targetBackup) {
      throw new Error('Backup non trovato');
    }

    if (!window.URL || !window.URL.createObjectURL) {
      throw new Error('Browser non supportato per il download dei file');
    }

    if (!document.createElement) {
      throw new Error('DOM non disponibile per il download');
    }

    const blob = new Blob([targetBackup.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const fileName = customPath || `backup-${backup.date.replace(/[/:, ]/g, '-')}.json`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    
    setTimeout(() => {
      try {
        a.click();
        setTimeout(() => {
          try {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (cleanupError) {
            console.warn('Errore nella pulizia:', cleanupError);
          }
        }, 100);
      } catch (clickError) {
        console.error('Errore nel click del download:', clickError);
        window.open(url, '_blank');
        setTimeout(() => {
          try {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (cleanupError) {
            console.warn('Errore nella pulizia fallback:', cleanupError);
          }
        }, 1000);
      }
    }, 10);
    
  } catch (error) {
    console.error('Errore nel download backup:', error);
    throw new Error('Impossibile scaricare il backup: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
  }
};
