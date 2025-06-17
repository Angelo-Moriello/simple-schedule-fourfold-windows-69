
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
    <div className="shadow-sm border p-4 sm:p-6 mb-6 bg-zinc-100 mx-0 rounded-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onPrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToday}>
            Oggi
          </Button>
          <Button variant="outline" size="sm" onClick={onNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenCalendar} className="ml-2">
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
        </div>
        <h1 className="text-xl sm:text-2xl text-gray-800 text-center font-semibold break-words">
          {format(currentDate, 'EEEE d MMMM yyyy', {
            locale: it
          })}
        </h1>
        <div className="hidden sm:block w-32"></div>
      </div>
    </div>
  );
};

export default DateNavigation;
