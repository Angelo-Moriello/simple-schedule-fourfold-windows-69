
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { it } from 'date-fns/locale';

interface DateNavigatorProps {
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onDateSelect
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handlePreviousDay = () => {
    const previousDay = subDays(selectedDate, 1);
    onDateSelect(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    onDateSelect(nextDay);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
      setShowDatePicker(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handlePreviousDay}
        variant="secondary"
        size="icon"
        className="shrink-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
        <PopoverTrigger asChild>
          <Button 
            variant="default" 
            size="lg"
            className="min-w-[140px] gap-2"
          >
            <span className="text-base">📅</span>
            <span className="text-sm font-medium">
              {format(selectedDate, 'dd/MM/yyyy', { locale: it })}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-white shadow-xl border border-gray-200 rounded-xl z-50" 
          align="start"
        >
          <CalendarComponent
            mode="single"
            captionLayout="dropdown"
            defaultMonth={selectedDate}
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="p-3 bg-white rounded-xl"
            locale={it}
          />
        </PopoverContent>
      </Popover>

      <Button
        onClick={handleNextDay}
        variant="secondary"
        size="icon"
        className="shrink-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DateNavigator;
