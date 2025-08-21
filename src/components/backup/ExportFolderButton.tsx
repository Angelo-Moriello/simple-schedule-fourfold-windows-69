import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';

interface ExportFolderButtonProps {
  onExportToFolder: () => void;
  disabled?: boolean;
}

const ExportFolderButton: React.FC<ExportFolderButtonProps> = ({ onExportToFolder, disabled = false }) => {
  const isSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  if (!isSupported) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full h-11 rounded-full bg-gray-300">
          <FolderOpen className="h-4 w-4 mr-2" />
          Salva in Cartella (Non Supportato)
        </Button>
        <p className="text-xs text-gray-500 text-center">
          Questa funzione richiede un browser moderno (Chrome, Edge)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={onExportToFolder}
        disabled={disabled}
        className="w-full h-11 rounded-full bg-purple-600 hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        Scarica Backup
      </Button>
      <p className="text-xs text-gray-500 text-center">
        Scarica il backup più recente sul dispositivo
      </p>
    </div>
  );
};

export default ExportFolderButton;