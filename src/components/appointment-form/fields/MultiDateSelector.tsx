import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MultiDateSelectorProps {
  selectedDates: Date[];
  onDatesChange: (dates: Date[]) => void;
  mainDate: Date;
}

const MultiDateSelector: React.FC<MultiDateSelectorProps> = ({
  selectedDates,
  onDatesChange,
  mainDate
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const datesRef = useRef<Date[]>(selectedDates);

  // Keep ref in sync with props
  React.useEffect(() => {
    datesRef.current = selectedDates;
  }, [selectedDates]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) return;

    // Don't allow selecting the main appointment date
    if (format(date, 'yyyy-MM-dd') === format(mainDate, 'yyyy-MM-dd')) {
      return;
    }

    const dateString = format(date, 'yyyy-MM-dd');
    const currentDates = datesRef.current;
    
    const isAlreadySelected = currentDates.some(
      selectedDate => format(selectedDate, 'yyyy-MM-dd') === dateString
    );

    let newDates: Date[];
    
    if (isAlreadySelected) {
      // Remove date if already selected
      newDates = currentDates.filter(
        selectedDate => format(selectedDate, 'yyyy-MM-dd') !== dateString
      );
      console.log('DEBUG - Data rimossa:', dateString, 'Date rimanenti:', newDates.length);
    } else {
      // Add date if not selected
      newDates = [...currentDates, date];
      console.log('DEBUG - Data aggiunta:', dateString, 'Totale date:', newDates.length);
    }
    
    // Update ref immediately
    datesRef.current = newDates;
    // Then update parent state
    onDatesChange(newDates);
  }, [mainDate, onDatesChange]);

  const removeDate = useCallback((dateToRemove: Date) => {
    const dateString = format(dateToRemove, 'yyyy-MM-dd');
    const currentDates = datesRef.current;
    
    const newDates = currentDates.filter(
      date => format(date, 'yyyy-MM-dd') !== dateString
    );
    
    console.log('DEBUG - Data rimossa manualmente:', dateString, 'Date rimanenti:', newDates.length);
    
    // Update ref immediately
    datesRef.current = newDates;
    // Then update parent state
    onDatesChange(newDates);
  }, [onDatesChange]);

  const clearAllDates = useCallback(() => {
    console.log('DEBUG - Cancellazione di tutte le date');
    datesRef.current = [];
    onDatesChange([]);
  }, [onDatesChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">
          Date Aggiuntive per Appuntamenti Ricorrenti
        </Label>
        {selectedDates.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAllDates}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancella tutto
          </Button>
        )}
      </div>

      <Popover open={showCalendar} onOpenChange={setShowCalendar}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>Seleziona date aggiuntive</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={handleDateSelect}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
            locale={it}
            disabled={(date) => {
              // Disable past dates and the main appointment date
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today || format(date, 'yyyy-MM-dd') === format(mainDate, 'yyyy-MM-dd');
            }}
          />
        </PopoverContent>
      </Popover>

      {selectedDates.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="mb-3">
              <Label className="text-sm font-medium text-blue-800">
                Date selezionate ({selectedDates.length})
              </Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedDates
                .sort((a, b) => a.getTime() - b.getTime())
                .map((date, index) => (
                  <div
                    key={`${format(date, 'yyyy-MM-dd')}-${index}`}
                    className="flex items-center gap-1 bg-white border border-blue-300 rounded-md px-2 py-1"
                  >
                    <span className="text-xs text-blue-800">
                      {format(date, 'dd/MM/yyyy', { locale: it })}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDate(date)}
                      className="h-4 w-4 p-0 hover:bg-blue-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Gli stessi servizi verranno creati anche in queste date
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiDateSelector;
