
export interface BackupEntry {
  date: string;
  type: 'manual' | 'automatic';
}

export interface BackupData {
  date: string;
  type: 'manual' | 'automatic';
  data: string;
}
