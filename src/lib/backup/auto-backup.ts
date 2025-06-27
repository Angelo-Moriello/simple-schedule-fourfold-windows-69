
import { createBackup } from './backup-operations';
import { safeLocalStorageGet, safeLocalStorageSet, isBrowserSupported } from './browser-compatibility';

let currentAutoBackupInterval: NodeJS.Timeout | null = null;

export const setAutoBackupInterval = (hours: number | null): void => {
  try {
    if (!isBrowserSupported()) {
      throw new Error('Browser non supportato per il backup automatico');
    }

    console.log('Configurazione backup automatico:', hours);
    
    if (currentAutoBackupInterval) {
      try {
        clearInterval(currentAutoBackupInterval);
        currentAutoBackupInterval = null;
        console.log('Intervallo precedente cancellato');
      } catch (clearError) {
        console.warn('Errore nella cancellazione intervallo:', clearError);
        currentAutoBackupInterval = null;
      }
    }

    if (hours && hours > 0) {
      const success = safeLocalStorageSet('auto-backup-interval-hours', hours.toString());
      if (!success) {
        throw new Error('Impossibile salvare le impostazioni di backup automatico');
      }
      
      // Convert hours to milliseconds, with special handling for small values (seconds)
      const intervalMs = hours >= 1 ? hours * 60 * 60 * 1000 : hours * 3600 * 1000;
      console.log('Impostazione intervallo ogni', intervalMs, 'ms');
      
      try {
        currentAutoBackupInterval = setInterval(async () => {
          try {
            console.log('Esecuzione backup automatico...');
            await createBackup('automatic');
            console.log('Backup automatico completato senza refresh della pagina');
          } catch (error) {
            console.error('Errore nel backup automatico:', error);
          }
        }, intervalMs);
        
        const unit = hours >= 1 ? 'ore' : 'secondi';
        const value = hours >= 1 ? hours : hours * 3600;
        console.log('Backup automatico configurato per ogni', value, unit);
      } catch (intervalError) {
        console.error('Errore nella creazione intervallo:', intervalError);
        throw new Error('Impossibile configurare l\'intervallo di backup automatico');
      }
    } else {
      safeLocalStorageSet('auto-backup-interval-hours', '');
      console.log('Backup automatico disabilitato');
    }
  } catch (error) {
    console.error('Errore nella configurazione backup automatico:', error);
    throw new Error('Impossibile configurare il backup automatico: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
  }
};

export const getAutoBackupInterval = async (): Promise<number | null> => {
  try {
    if (!isBrowserSupported()) {
      return null;
    }
    
    const hours = safeLocalStorageGet('auto-backup-interval-hours', '');
    const result = hours && hours !== '' ? parseFloat(hours) : null;
    console.log('Intervallo backup recuperato:', result);
    return result;
  } catch (error) {
    console.error('Errore nel recupero intervallo backup:', error);
    return null;
  }
};

export const initializeAutoBackup = async (): Promise<void> => {
  try {
    if (!isBrowserSupported()) {
      console.warn('Browser non supportato per l\'inizializzazione backup automatico');
      return;
    }
    
    const savedInterval = await getAutoBackupInterval();
    if (savedInterval) {
      console.log('Ripristino backup automatico:', savedInterval, savedInterval >= 1 ? 'ore' : 'secondi');
      setAutoBackupInterval(savedInterval);
    }
  } catch (error) {
    console.error('Errore nell\'inizializzazione backup automatico:', error);
  }
};
