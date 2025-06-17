
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface DateNavigationProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onOpenCalendar: () => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  currentDate,
  onPrevDay,
  onNextDay,
  onToday,
  onOpenCalendar
}) => {
  return (
    <div className="w-full flex justify-center">
      <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-6 mb-8 py-[17px] mx-0 px-[8px] w-full max-w-4xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
          <div className="flex items-center gap-3 order-2 lg:order-1">
            <Button variant="outline" size="sm" onClick={onPrevDay} className="h-10 w-10 rounded-full border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onToday} className="px-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
              Oggi
            </Button>
            <Button variant="outline" size="sm" onClick={onNextDay} className="h-10 w-10 rounded-full border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center flex-1 order-1 lg:order-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent px-2 truncate">
              {format(currentDate, 'EEEE d MMMM yyyy', {
                locale: it
              })}
            </h1>
          </div>
          
          <div className="flex justify-center order-3 lg:order-3">
            <Button variant="outline" size="sm" onClick={onOpenCalendar} className="rounded-full border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 px-[10px]">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateNavigation;
