
import React, { useState, useCallback, useEffect } from 'react';
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

  // Debug logging più dettagliato
  useEffect(() => {
    console.log('🔍 MultiDateSelector - RENDER STATE:', {
      selectedDates: selectedDates?.map(d => format(d, 'yyyy-MM-dd')) || [],
      mainDate: format(mainDate, 'yyyy-MM-dd'),
      totalSelected: selectedDates?.length || 0,
      onDatesChangeType: typeof onDatesChange,
      propsReceived: {
        selectedDates: !!selectedDates,
        onDatesChange: !!onDatesChange,
        mainDate: !!mainDate
      }
    });
  }, [selectedDates, mainDate, onDatesChange]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    console.log('🎯 MultiDateSelector - CLICK RICEVUTO:', {
      clickedDate: date ? format(date, 'yyyy-MM-dd') : 'undefined',
      currentSelectedDates: selectedDates?.map(d => format(d, 'yyyy-MM-dd')) || [],
      mainDate: format(mainDate, 'yyyy-MM-dd')
    });

    if (!date) {
      console.log('⚠️ MultiDateSelector - Data non valida, uscita anticipata');
      return;
    }

    const mainDateString = format(mainDate, 'yyyy-MM-dd');
    const selectedDateString = format(date, 'yyyy-MM-dd');
    
    console.log('🔄 MultiDateSelector - CONFRONTO DATE:', {
      selectedDate: selectedDateString,
      mainDate: mainDateString,
      isMainDate: selectedDateString === mainDateString,
      shouldBlock: selectedDateString === mainDateString
    });

    // Non permettere di selezionare la data principale
    if (selectedDateString === mainDateString) {
      console.log('🚫 MultiDateSelector - Data principale bloccata');
      return;
    }

    const currentDates = selectedDates || [];
    const isAlreadySelected = currentDates.some(
      selectedDate => format(selectedDate, 'yyyy-MM-dd') === selectedDateString
    );

    let newDates: Date[];
    
    if (isAlreadySelected) {
      // Rimuovi la data se già selezionata
      newDates = currentDates.filter(
        selectedDate => format(selectedDate, 'yyyy-MM-dd') !== selectedDateString
      );
      console.log('➖ MultiDateSelector - Data rimossa:', {
        removedDate: selectedDateString,
        newDatesCount: newDates.length,
        newDates: newDates.map(d => format(d, 'yyyy-MM-dd'))
      });
    } else {
      // Aggiungi la data se non selezionata
      newDates = [...currentDates, new Date(date.getTime())];
      console.log('➕ MultiDateSelector - Data aggiunta:', {
        addedDate: selectedDateString,
        newDatesCount: newDates.length,
        newDates: newDates.map(d => format(d, 'yyyy-MM-dd'))
      });
    }
    
    console.log('📤 MultiDateSelector - CHIAMATA onDatesChange:', {
      functionExists: !!onDatesChange,
      newDatesArray: newDates.map(d => format(d, 'yyyy-MM-dd')),
      arrayLength: newDates.length
    });
    
    if (onDatesChange && typeof onDatesChange === 'function') {
      onDatesChange(newDates);
      console.log('✅ MultiDateSelector - onDatesChange chiamata con successo');
    } else {
      console.error('❌ MultiDateSelector - onDatesChange non è una funzione valida!', {
        onDatesChange,
        type: typeof onDatesChange
      });
    }
    
  }, [selectedDates, mainDate, onDatesChange]);

  const removeDate = useCallback((dateToRemove: Date) => {
    const dateString = format(dateToRemove, 'yyyy-MM-dd');
    
    const currentDates = selectedDates || [];
    const newDates = currentDates.filter(
      date => format(date, 'yyyy-MM-dd') !== dateString
    );
    
    console.log('🗑️ MultiDateSelector - Rimozione manuale:', {
      removedDate: dateString,
      before: currentDates.length,
      after: newDates.length
    });
    
    if (onDatesChange) {
      onDatesChange(newDates);
    }
  }, [selectedDates, onDatesChange]);

  const clearAllDates = useCallback(() => {
    console.log('🧹 MultiDateSelector - Cancellazione completa');
    if (onDatesChange) {
      onDatesChange([]);
    }
  }, [onDatesChange]);

  const displaySelectedDates = selectedDates || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">
          Date Aggiuntive per Appuntamenti Ricorrenti
        </Label>
        {displaySelectedDates.length > 0 && (
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
            <span>Seleziona date aggiuntive ({displaySelectedDates.length} selezionate)</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={handleDateSelect}
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

      {displaySelectedDates.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="mb-3">
              <Label className="text-sm font-medium text-blue-800">
                Date selezionate ({displaySelectedDates.length})
              </Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {displaySelectedDates
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
