
import { useCallback } from 'react';
import { format } from 'date-fns';

export const useDateSelection = (
  selectedDates: Date[],
  mainDate: Date,
  onDatesChange: (dates: Date[]) => void
) => {
  const handleDateSelect = useCallback((date: Date | undefined) => {
    console.log('🎯 DateSelection - CLICK RICEVUTO:', {
      clickedDate: date ? format(date, 'yyyy-MM-dd') : 'undefined',
      currentSelectedDates: selectedDates?.map(d => format(d, 'yyyy-MM-dd')) || [],
      mainDate: format(mainDate, 'yyyy-MM-dd')
    });

    if (!date) {
      console.log('⚠️ DateSelection - Data non valida, uscita anticipata');
      return;
    }

    const mainDateString = format(mainDate, 'yyyy-MM-dd');
    const selectedDateString = format(date, 'yyyy-MM-dd');
    
    console.log('🔄 DateSelection - CONFRONTO DATE:', {
      selectedDate: selectedDateString,
      mainDate: mainDateString,
      isMainDate: selectedDateString === mainDateString,
      shouldBlock: selectedDateString === mainDateString
    });

    // Non permettere di selezionare la data principale
    if (selectedDateString === mainDateString) {
      console.log('🚫 DateSelection - Data principale bloccata');
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
      console.log('➖ DateSelection - Data rimossa:', {
        removedDate: selectedDateString,
        newDatesCount: newDates.length,
        newDates: newDates.map(d => format(d, 'yyyy-MM-dd'))
      });
    } else {
      // Aggiungi la data se non selezionata
      newDates = [...currentDates, new Date(date.getTime())];
      console.log('➕ DateSelection - Data aggiunta:', {
        addedDate: selectedDateString,
        newDatesCount: newDates.length,
        newDates: newDates.map(d => format(d, 'yyyy-MM-dd'))
      });
    }
    
    console.log('📤 DateSelection - CHIAMATA onDatesChange:', {
      functionExists: !!onDatesChange,
      newDatesArray: newDates.map(d => format(d, 'yyyy-MM-dd')),
      arrayLength: newDates.length
    });
    
    if (onDatesChange && typeof onDatesChange === 'function') {
      onDatesChange(newDates);
      console.log('✅ DateSelection - onDatesChange chiamata con successo');
    } else {
      console.error('❌ DateSelection - onDatesChange non è una funzione valida!', {
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
    
    console.log('🗑️ DateSelection - Rimozione manuale:', {
      removedDate: dateString,
      before: currentDates.length,
      after: newDates.length
    });
    
    if (onDatesChange) {
      onDatesChange(newDates);
    }
  }, [selectedDates, onDatesChange]);

  const clearAllDates = useCallback(() => {
    console.log('🧹 DateSelection - Cancellazione completa');
    if (onDatesChange) {
      onDatesChange([]);
    }
  }, [onDatesChange]);

  return {
    handleDateSelect,
    removeDate,
    clearAllDates
  };
};
