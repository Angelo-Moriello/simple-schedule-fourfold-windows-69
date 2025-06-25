
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import BackupManager from './BackupManager';

const AppointmentSchedulerHeader: React.FC = () => {
  const { signOut } = useAuth();

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
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-800 p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <span className="text-2xl sm:text-3xl lg:text-4xl">📅</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Sistema Gestione Appuntamenti
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">Organizza i tuoi appuntamenti facilmente</p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <BackupManager />
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 print:hidden bg-white/50 backdrop-blur-sm border-gray-300/50 hover:bg-white/80"
          >
            <span className="text-lg mr-2">🚪</span>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSchedulerHeader;
