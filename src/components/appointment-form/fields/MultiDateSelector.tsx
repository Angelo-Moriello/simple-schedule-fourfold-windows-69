
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useDateSelection } from './multi-date/DateSelectionLogic';
import SelectedDatesList from './multi-date/SelectedDatesList';
import DateCalendarPopover from './multi-date/DateCalendarPopover';

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

  const { handleDateSelect, removeDate, clearAllDates } = useDateSelection(
    selectedDates,
    mainDate,
    onDatesChange
  );

  const displaySelectedDates = selectedDates || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">
          Date Aggiuntive per Appuntamenti Ricorrenti
        </Label>
      </div>

      <DateCalendarPopover
        selectedDatesCount={displaySelectedDates.length}
        showCalendar={showCalendar}
        onToggleCalendar={setShowCalendar}
        onDateSelect={handleDateSelect}
        mainDate={mainDate}
      />

      <SelectedDatesList
        selectedDates={displaySelectedDates}
        onRemoveDate={removeDate}
        onClearAll={clearAllDates}
      />
    </div>
  );
};

export default MultiDateSelector;
