
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Save } from 'lucide-react';

interface ManualBackupCardProps {
  onBackup: () => void;
}

const ManualBackupCard: React.FC<ManualBackupCardProps> = ({ onBackup }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="h-4 w-4" />
          Backup Manuale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Scarica immediatamente una copia di tutti i tuoi dati
        </p>
        <Button onClick={onBackup} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Scarica Backup Ora
        </Button>
      </CardContent>
    </Card>
  );
};

export default ManualBackupCard;
