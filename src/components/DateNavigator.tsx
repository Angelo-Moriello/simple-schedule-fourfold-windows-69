
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Unified button styles to match other components
  const buttonStyles = "h-12 text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0";

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
        className={`${buttonStyles} w-12 p-0 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
        <PopoverTrigger asChild>
          <Button className={`${buttonStyles} px-4 min-w-[140px] justify-start bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2`}>
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{format(selectedDate, 'dd/MM/yyyy', { locale: it })}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white shadow-xl border-0 rounded-xl z-50" align="start">
          <CalendarComponent
            mode="single"
            captionLayout="dropdown"
            defaultMonth={selectedDate}
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="p-3 pointer-events-auto bg-white rounded-xl"
            locale={it}
          />
        </PopoverContent>
      </Popover>

      <Button
        onClick={handleNextDay}
        className={`${buttonStyles} w-12 p-0 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white`}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DateNavigator;
