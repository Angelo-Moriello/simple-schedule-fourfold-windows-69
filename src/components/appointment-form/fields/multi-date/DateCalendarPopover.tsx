
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateCalendarPopoverProps {
  selectedDatesCount: number;
  showCalendar: boolean;
  onToggleCalendar: (open: boolean) => void;
  onDateSelect: (date: Date | undefined) => void;
  mainDate: Date;
}

const DateCalendarPopover: React.FC<DateCalendarPopoverProps> = ({
  selectedDatesCount,
  showCalendar,
  onToggleCalendar,
  onDateSelect,
  mainDate
}) => {
  return (
    <Popover open={showCalendar} onOpenChange={onToggleCalendar}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>Seleziona date aggiuntive ({selectedDatesCount} selezionate)</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={undefined}
          onSelect={onDateSelect}
          initialFocus
          className={cn("p-3")}
          locale={it}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today || format(date, 'yyyy-MM-dd') === format(mainDate, 'yyyy-MM-dd');
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateCalendarPopover;
