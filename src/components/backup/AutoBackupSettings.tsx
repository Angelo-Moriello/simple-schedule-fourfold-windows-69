
import React from 'react';
import { Input } from '@/components/ui/input';

interface AutoBackupSettingsProps {
  autoBackupEnabled: boolean;
  backupInterval: number;
  isConfiguring: boolean;
  onToggle: (enabled: boolean) => void;
  onIntervalChange: (value: string) => void;
}

const AutoBackupSettings: React.FC<AutoBackupSettingsProps> = ({
  autoBackupEnabled,
  backupInterval,
  isConfiguring,
  onToggle,
  onIntervalChange
}) => {
  return (
    <div className="border rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-2">
          <span className="text-base">⚙️</span>
          Backup Automatico
        </span>
        <div className="flex items-center space-x-2">
          <label htmlFor="auto-backup" className="text-sm">
            {autoBackupEnabled ? '🟢' : '🔴'}
          </label>
          <input
            id="auto-backup"
            type="checkbox"
            checked={autoBackupEnabled}
            onChange={(e) => onToggle(e.target.checked)}
            disabled={isConfiguring}
            className="rounded"
          />
          {isConfiguring && <span className="text-xs">⏳</span>}
        </div>
      </div>
      
      {autoBackupEnabled && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              <span className="text-sm">⏰</span>
              Frequenza
            </label>
            <select
              value={backupInterval}
              onChange={(e) => onIntervalChange(e.target.value)}
              disabled={isConfiguring}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value={5/3600}>Ogni 5 secondi</option>
              <option value={30/3600}>Ogni 30 secondi</option>
              <option value={1/60}>Ogni minuto</option>
              <option value={5/60}>Ogni 5 minuti</option>
              <option value={1}>Ogni ora</option>
              <option value={2}>Ogni 2 ore</option>
              <option value={6}>Ogni 6 ore</option>
              <option value={12}>Ogni 12 ore</option>
              <option value={24}>Ogni giorno</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoBackupSettings;
