
import React from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarDays } from 'lucide-react';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

interface AppointmentFiltersProps {
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
}

const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  dateFilter,
  setDateFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
}) => {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="date-filter" className="text-sm font-medium mb-2 block">
            Filtra per periodo
          </Label>
          <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
            <SelectTrigger id="date-filter" className="h-10">
              <CalendarDays className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli appuntamenti</SelectItem>
              <SelectItem value="today">Oggi</SelectItem>
              <SelectItem value="week">Questa settimana</SelectItem>
              <SelectItem value="month">Questo mese</SelectItem>
              <SelectItem value="custom">Periodo personalizzato</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateFilter === 'custom' && (
          <>
            <div>
              <Label htmlFor="start-date" className="text-sm font-medium mb-2 block">
                Data inizio
              </Label>
              <input
                id="start-date"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-10 w-full px-3 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-sm font-medium mb-2 block">
                Data fine
              </Label>
              <input
                id="end-date"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-10 w-full px-3 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default AppointmentFilters;
