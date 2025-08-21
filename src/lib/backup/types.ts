
export interface BackupEntry {
  date: string;
  type: 'manual' | 'automatic';
  // ISO timestamp to allow reliable matching and restore
  iso?: string;
}

export interface BackupData {
  date: string;
  type: 'manual' | 'automatic';
  data: string;
}
