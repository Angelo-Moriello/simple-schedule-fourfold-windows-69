
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Printer, ArrowLeft } from 'lucide-react';

interface StatisticsHeaderProps {
  onPrint: () => void;
  onBack?: () => void;
}

const StatisticsHeader: React.FC<StatisticsHeaderProps> = ({ onPrint, onBack }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-800 p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">Analisi delle performance del salone</p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onPrint}
            className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 print:hidden bg-white/50 backdrop-blur-sm border-gray-300/50 hover:bg-white/80"
          >
            <Printer className="h-4 w-4 mr-2" />
            Stampa
          </Button>
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 print:hidden bg-white/50 backdrop-blur-sm border-gray-300/50 hover:bg-white/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Indietro
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsHeader;
