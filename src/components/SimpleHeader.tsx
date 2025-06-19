
import React from 'react';

interface SimpleHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const SimpleHeader = ({ title, subtitle, children }: SimpleHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
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
      {children && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export default SimpleHeader;
