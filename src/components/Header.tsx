
import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const Header = ({ title, subtitle, children }: HeaderProps) => {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <img 
            src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
            alt="Da Capo a Piedi - Estetica & Parrucchieri" 
            className="h-12 w-12 sm:h-16 sm:w-16 object-contain rounded-lg shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {children && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
