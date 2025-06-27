
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BackupInfoCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Informazioni</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• I backup includono appuntamenti, dipendenti e servizi</p>
          <p>• I file vengono salvati in formato JSON</p>
          <p>• È consigliabile effettuare backup regolari</p>
          <p>• I backup automatici vengono scaricati nella cartella Download</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackupInfoCard;
