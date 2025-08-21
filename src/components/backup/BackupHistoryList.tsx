
import React from 'react';
import { Button } from '@/components/ui/button';
import { BackupEntry } from '@/lib/backup/types';

interface BackupHistoryListProps {
  backupHistory: BackupEntry[];
  onDownload: (backup: BackupEntry) => void;
  onRestore?: (backup: BackupEntry) => void;
}

const BackupHistoryList: React.FC<BackupHistoryListProps> = ({ backupHistory, onDownload, onRestore }) => {
  if (backupHistory.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <span className="text-base">📋</span>
        Cronologia Backup ({backupHistory.length})
      </h4>
      <div className="max-h-32 overflow-y-auto space-y-1">
        {backupHistory.map((backup, index) => (
          <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
            <span className="flex items-center gap-1">
              <span className="text-sm">{backup.type === 'manual' ? '👆' : '🤖'}</span>
              {backup.date}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(backup)}
                className="h-6 w-6 p-0 rounded-full hover:bg-gray-200"
                aria-label="Scarica backup"
              >
                <span className="text-xs">⬇️</span>
              </Button>
              {onRestore && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRestore(backup)}
                  className="h-6 w-6 p-0 rounded-full hover:bg-gray-200"
                  aria-label="Ripristina backup"
                >
                  <span className="text-xs">↩️</span>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackupHistoryList;
