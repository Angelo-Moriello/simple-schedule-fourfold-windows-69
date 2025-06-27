
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

interface RestoreBackupCardProps {
  onRestore: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RestoreBackupCard: React.FC<RestoreBackupCardProps> = ({ onRestore }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Ripristina Backup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Carica un file di backup per ripristinare i tuoi dati
        </p>
        <div className="space-y-2">
          <Label htmlFor="backup-file" className="text-sm">
            Seleziona file di backup (.json)
          </Label>
          <Input
            id="backup-file"
            type="file"
            accept=".json"
            onChange={onRestore}
            className="cursor-pointer"
          />
        </div>
        <div className="bg-amber-50 p-3 rounded-lg">
          <p className="text-xs text-amber-700">
            ⚠️ Il ripristino sovrascriverà tutti i dati attuali. Assicurati di aver fatto un backup prima di procedere.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestoreBackupCard;
