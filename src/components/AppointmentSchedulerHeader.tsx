import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import BackupManager from './BackupManager';
const AppointmentSchedulerHeader: React.FC = () => {
  const {
    signOut,
    user
  } = useAuth();
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
  return <div className="rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 bg-stone-100">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 shadow-sm border border-gray-400 mr-8">
            <img src="/lovable-uploads/01e5b397-b7ba-48e1-a891-b2bc1d71f3ba.png" alt="Da Capo a Piedi - Estetica & Parrucchieri" className="h-28 w-auto object-contain" />
          </div>
        </div>

        {/* Center Title */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
            <h1 className="text-3xl font-bold text-gray-800 leading-tight">
              Sistema Gestione<br />
              Appuntamenti
            </h1>
            <div className="w-2 h-2 bg-emerald-500 rounded-full ml-3 animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-base font-medium">Gestione professionale clienti e servizi By AM Design</p>
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          <div className="text-right bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Benvenuto</p>
            <p className="font-semibold text-gray-800 text-sm">{user?.email || 'angelo_moriello@hotmail.it'}</p>
          </div>
          
          <BackupManager />
          
          <Button onClick={handleLogout} variant="destructive" className="px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200">
            🚪 Esci
          </Button>
        </div>
      </div>
    </div>;
};
export default AppointmentSchedulerHeader;