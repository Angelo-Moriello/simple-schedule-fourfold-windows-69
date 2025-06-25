
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
    <div className="rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
        
        {/* Left Section - Logo and Title */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-6 w-full lg:w-auto">
          {/* Logo Container */}
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-300">
            <img 
              src="/lovable-uploads/01e5b397-b7ba-48e1-a891-b2bc1d71f3ba.png" 
              alt="Da Capo a Piedi - Estetica & Parrucchieri" 
              className="h-28 sm:h-32 lg:h-40 w-auto object-contain" 
            />
          </div>

          {/* Title Section */}
          <div className="flex flex-col justify-center text-center lg:text-left">
            {/* Main Title */}
            <div className="flex items-center justify-center lg:justify-start mb-1">
              <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">
                Sistema
              </h1>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight mb-2 lg:mb-3">
              Appuntamenti
            </h2>
            
            {/* Subtitle */}
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">
              Da Capo a Piedi<br />
              Designed By AM Design
            </p>
          </div>
        </div>

        {/* Right Section - User Info and Actions */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto lg:min-w-fit">
          <div className="text-center sm:text-right bg-gradient-to-br from-slate-50 to-white rounded-xl p-2 sm:p-3 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Benvenuto</p>
            <p className="font-semibold text-gray-800 text-xs sm:text-sm">{user?.email || 'angelo_moriello@hotmail.it'}</p>
          </div>
          
          {/* Backup button - only visible on desktop */}
          {!isMobile && <BackupManager />}
          
          <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm">
            🚪 Esci
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSchedulerHeader;
