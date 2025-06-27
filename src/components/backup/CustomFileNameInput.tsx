
import React from 'react';
import { Input } from '@/components/ui/input';

interface CustomFileNameInputProps {
  customFileName: string;
  onChange: (value: string) => void;
}

const CustomFileNameInput: React.FC<CustomFileNameInputProps> = ({ customFileName, onChange }) => {
  return (
    <div className="border rounded-lg p-3 space-y-3">
      <label className="block text-sm font-medium flex items-center gap-1">
        <span className="text-sm">📁</span>
        Nome file personalizzato (opzionale)
      </label>
      <Input
        type="text"
        placeholder="backup-personalizzato.json"
        value={customFileName}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm"
      />
      <p className="text-xs text-gray-500">
        Se lasci vuoto, verrà usato il nome automatico
      </p>
    </div>
  );
};

export default CustomFileNameInput;
