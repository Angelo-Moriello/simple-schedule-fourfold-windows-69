
import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface BackupStatusInfoProps {
  lastBackupTime: Date | null;
  autoBackupEnabled: boolean;
}

const BackupStatusInfo: React.FC<BackupStatusInfoProps> = ({ 
  lastBackupTime, 
  autoBackupEnabled 
}) => {
  if (!autoBackupEnabled || !lastBackupTime) return null;

  return (
    <p className="text-xs text-gray-500">
      Ultimo backup: {format(lastBackupTime, "dd/MM/yyyy 'alle' HH:mm", { locale: it })}
    </p>
  );
};

export default BackupStatusInfo;
