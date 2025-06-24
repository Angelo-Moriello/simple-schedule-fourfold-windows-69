interface BackupEntry {
  date: string;
  type: 'manual' | 'automatic';
}

// Simulate backup functionality using localStorage
export const createBackup = async (type: 'manual' | 'automatic'): Promise<void> => {
  const timestamp = new Date().toISOString();
  const backupData = {
    date: timestamp,
    type,
    data: {
      // Here would go the actual appointment data
      appointments: JSON.parse(localStorage.getItem('appointments') || '[]'),
      employees: JSON.parse(localStorage.getItem('employees') || '[]'),
      clients: JSON.parse(localStorage.getItem('clients') || '[]')
    }
  };

  // Store backup in localStorage
  const backups = JSON.parse(localStorage.getItem('local-backups') || '[]');
  backups.push({
    date: timestamp,
    type,
    data: JSON.stringify(backupData)
  });

  // Keep only backups from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const filteredBackups = backups.filter((backup: any) => 
    new Date(backup.date) >= thirtyDaysAgo
  );

  localStorage.setItem('local-backups', JSON.stringify(filteredBackups));
  localStorage.setItem('last-backup-time', timestamp);
};

export const getBackupHistory = async (): Promise<BackupEntry[]> => {
  const backups = JSON.parse(localStorage.getItem('local-backups') || '[]');
  return backups.map((backup: any) => ({
    date: new Date(backup.date).toLocaleString('it-IT'),
    type: backup.type
  }));
};

export const downloadBackupFile = async (backup: BackupEntry): Promise<void> => {
  const backups = JSON.parse(localStorage.getItem('local-backups') || '[]');
  const targetBackup = backups.find((b: any) => 
    new Date(b.date).toLocaleString('it-IT') === backup.date && b.type === backup.type
  );

  if (targetBackup) {
    const blob = new Blob([targetBackup.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${backup.date.replace(/[/:]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

export const getLastBackupTime = async (): Promise<string | null> => {
  const lastBackup = localStorage.getItem('last-backup-time');
  return lastBackup ? new Date(lastBackup).toLocaleString('it-IT') : null;
};

export const setAutoBackupInterval = (hours: number | null): void => {
  // Clear existing interval
  const existingInterval = localStorage.getItem('auto-backup-interval-id');
  if (existingInterval) {
    clearInterval(parseInt(existingInterval));
    localStorage.removeItem('auto-backup-interval-id');
  }

  if (hours) {
    localStorage.setItem('auto-backup-interval-hours', hours.toString());
    
    // Set up new interval
    const intervalId = setInterval(() => {
      createBackup('automatic');
    }, hours * 60 * 60 * 1000); // Convert hours to milliseconds
    
    localStorage.setItem('auto-backup-interval-id', intervalId.toString());
  } else {
    localStorage.removeItem('auto-backup-interval-hours');
  }
};

export const getAutoBackupInterval = async (): Promise<number | null> => {
  const hours = localStorage.getItem('auto-backup-interval-hours');
  return hours ? parseInt(hours) : null;
};
