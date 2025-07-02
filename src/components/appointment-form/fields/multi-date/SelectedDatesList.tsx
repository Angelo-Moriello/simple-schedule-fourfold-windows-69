
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface SelectedDatesListProps {
  selectedDates: Date[];
  onRemoveDate: (date: Date) => void;
  onClearAll: () => void;
}

const SelectedDatesList: React.FC<SelectedDatesListProps> = ({
  selectedDates,
  onRemoveDate,
  onClearAll
}) => {
  if (selectedDates.length === 0) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <Label className="text-sm font-medium text-blue-800">
            Date selezionate ({selectedDates.length})
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancella tutto
          </Button>
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
                  onClick={() => onRemoveDate(date)}
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
  );
};

export default SelectedDatesList;
