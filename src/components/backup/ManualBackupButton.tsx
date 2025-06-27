
import React from 'react';
import { Button } from '@/components/ui/button';

interface ManualBackupButtonProps {
  onCreateBackup: () => void;
  isCreatingBackup: boolean;
  disabled?: boolean;
}

const ManualBackupButton: React.FC<ManualBackupButtonProps> = ({
  onCreateBackup,
  isCreatingBackup,
  disabled = false
}) => {
  return (
    <Button 
      onClick={onCreateBackup}
      disabled={isCreatingBackup || disabled}
      className="w-full h-11 rounded-full bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <span className="text-lg mr-2">📤</span>
      {isCreatingBackup ? 'Creazione backup...' : 'Backup Manuale'}
    </Button>
  );
};

export default ManualBackupButton;
