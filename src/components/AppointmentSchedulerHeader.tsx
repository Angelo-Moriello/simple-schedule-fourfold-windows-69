
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import BackupManager from './BackupManager';

const AppointmentSchedulerHeader: React.FC = () => {
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    console.log('DEBUG - Tentativo di logout...');
    try {
      await signOut();
      console.log('DEBUG - Logout completato');
      // Force page refresh after logout
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center">
          <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 mr-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 leading-tight">
                DA CAPO<br />
                A PIEDI
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ESTETICA & PARRUCCHIERI
              </div>
            </div>
          </div>
        </div>

        {/* Center Title */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
            <h1 className="text-4xl font-bold text-gray-800">
              Sistema<br />
              Appuntamenti
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Da Capo a Piedi</p>
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Benvenuto</p>
            <p className="font-medium text-gray-800">{user?.email || 'angelo_moriello@hotmail.it'}</p>
          </div>
          
          <BackupManager />
          
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium"
          >
            🚪 Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSchedulerHeader;
