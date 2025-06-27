
import React from 'react';

interface BackupStatusDisplayProps {
  lastBackup: string | null;
  browserError: string | null;
}

const BackupStatusDisplay: React.FC<BackupStatusDisplayProps> = ({ 
  lastBackup, 
  browserError 
}) => {
  if (browserError) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            <span className="text-base mr-1">❌</span>
            {browserError}
          </p>
          <p className="text-xs text-red-600 mt-2">
            Prova ad aggiornare il browser o utilizzare un browser diverso (Firefox, Edge, Safari).
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <span className="text-base mr-1">ℹ️</span>
          I backup includono: appuntamenti, dipendenti, clienti, servizi, ferie, trattamenti ricorrenti, storico e statistiche. Vengono eliminati automaticamente dopo 30 giorni.
        </p>
      </div>

      {lastBackup && (
        <div className="text-xs text-gray-500 text-center bg-gray-50 p-2 rounded">
          <span className="mr-1">🕐</span>
          Ultimo backup: {lastBackup}
        </div>
      )}
    </>
  );
};

export default BackupStatusDisplay;
