import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';

interface ImportFileButtonProps {
  onImportFile: (file: File) => void;
  disabled?: boolean;
}

const ImportFileButton: React.FC<ImportFileButtonProps> = ({ onImportFile, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportFile(file);
      // Reset input per permettere ri-selezione dello stesso file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        variant="outline"
        className="w-full h-11 rounded-full border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all duration-200"
      >
        <Upload className="h-4 w-4 mr-2" />
        Importa Backup da File
      </Button>
      <Input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="text-xs text-gray-500 text-center">
        Seleziona un file .json di backup da importare
      </p>
    </div>
  );
};

export default ImportFileButton;