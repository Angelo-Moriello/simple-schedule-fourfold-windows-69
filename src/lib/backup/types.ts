
export interface BackupEntry {
  date: string;
  type: 'manual' | 'automatic';
  // ISO timestamp to allow reliable matching and restore
  iso?: string;
}

// Metadata stored in localStorage; payload is stored separately (IndexedDB)
export interface BackupData {
  date: string;
  type: 'manual' | 'automatic';
  data?: string; // legacy inline payload
  payloadKey?: string; // key for IndexedDB payload
}

