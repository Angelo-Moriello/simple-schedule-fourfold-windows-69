
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { it } from 'date-fns/locale';

interface DateNavigatorProps {
  selectedDate: Date;
  showFullCalendar: boolean;
  onDateSelect: (date: Date | undefined) => void;
  onShowFullCalendar: (show: boolean) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  showFullCalendar,
  onDateSelect,
  onShowFullCalendar
}) => {
  const handlePreviousDay = () => {
    const previousDay = subDays(selectedDate, 1);
    onDateSelect(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    onDateSelect(nextDay);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousDay}
        className="h-9 w-9 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover open={showFullCalendar} onOpenChange={onShowFullCalendar}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 px-3 min-w-[140px] justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="text-sm">{format(selectedDate, 'dd/MM/yyyy', { locale: it })}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            captionLayout="dropdown"
            defaultMonth={selectedDate}
            selected={selectedDate}
            onSelect={onDateSelect}
            className="rounded-md border-0"
            style={{ width: '100%' }}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNextDay}
        className="h-9 w-9 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DateNavigator;
