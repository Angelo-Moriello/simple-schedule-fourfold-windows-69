
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import BackupManager from './BackupManager';
import { useIsMobile } from '@/hooks/use-mobile';

const AppointmentSchedulerHeader: React.FC = () => {
  const {
    signOut,
    user
  } = useAuth();
  const isMobile = useIsMobile();

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
    <div className="rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-6 mb-4 sm:mb-6 bg-stone-100">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0">
        {/* Logo Section */}
        <div className="flex items-center justify-center lg:justify-start w-full lg:w-auto">
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-400">
            <img 
              src="/lovable-uploads/01e5b397-b7ba-48e1-a891-b2bc1d71f3ba.png" 
              alt="Da Capo a Piedi - Estetica & Parrucchieri" 
              className="h-16 sm:h-20 lg:h-28 w-auto object-contain" 
            />
          </div>
        </div>

        {/* Center Title - Hidden on mobile, visible on larger screens */}
        <div className="hidden lg:flex flex-1 text-center">
          <div className="flex items-center justify-center mb-2 w-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
            <h1 className="text-2xl xl:text-3xl font-bold text-gray-800 leading-tight">
              Gestione Agenda<br />
              Professionale
            </h1>
            <div className="w-2 h-2 bg-emerald-500 rounded-full ml-3 animate-pulse"></div>
          </div>
        </div>

        {/* Mobile Title - Visible only on mobile */}
        <div className="flex lg:hidden flex-col items-center text-center w-full">
          <div className="flex items-center justify-center mb-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">
              Gestione Agenda Professionale
            </h1>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-2 animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm font-medium">Gestione professionale clienti e servizi By AM Design</p>
        </div>

        {/* User Section */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
          <div className="text-center sm:text-right bg-gradient-to-br from-slate-50 to-white rounded-xl p-2 sm:p-3 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Benvenuto</p>
            <p className="font-semibold text-gray-800 text-xs sm:text-sm">{user?.email || 'angelo_moriello@hotmail.it'}</p>
          </div>
          
          {/* Backup button - only visible on desktop */}
          {!isMobile && <BackupManager />}
          
          <Button 
            onClick={handleLogout} 
            variant="destructive" 
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
          >
            🚪 Esci
          </Button>
        </div>
      </div>

      {/* Subtitle for larger screens */}
      <div className="hidden lg:block text-center mt-2">
        <p className="text-gray-600 text-base font-medium">Gestione professionale clienti e servizi By AM Design</p>
      </div>
    </div>
  );
};

export default AppointmentSchedulerHeader;
