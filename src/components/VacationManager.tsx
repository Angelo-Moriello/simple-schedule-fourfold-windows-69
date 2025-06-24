
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane, Trash2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Employee } from '@/types/appointment';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface VacationEntry {
  date: string;
  type: 'full' | 'morning' | 'afternoon' | 'hours';
  startTime?: string;
  endTime?: string;
}

interface VacationManagerProps {
  employees: Employee[];
  onUpdateEmployeeVacations: (employeeId: number, vacations: string[]) => void;
}

const VacationManager: React.FC<VacationManagerProps> = ({
  employees,
  onUpdateEmployeeVacations
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [vacationType, setVacationType] = useState<'full' | 'morning' | 'afternoon' | 'hours'>('full');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const selectedEmployee = employees.find(emp => emp.id.toString() === selectedEmployeeId);

  const parseVacationEntries = (vacations: string[]): VacationEntry[] => {
    return vacations.map(vacation => {
      try {
        // Try to parse as JSON for new format
        return JSON.parse(vacation) as VacationEntry;
      } catch {
        // Fallback to old format (just date strings)
        return {
          date: vacation,
          type: 'full'
        };
      }
    });
  };

  const formatVacationEntry = (entry: VacationEntry): string => {
    return JSON.stringify(entry);
  };

  const handleAddVacation = () => {
    if (!selectedDate || !selectedEmployeeId) return;

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const newEntry: VacationEntry = {
      date: dateString,
      type: vacationType,
      ...(vacationType === 'hours' && { startTime, endTime })
    };

    const existingVacations = selectedEmployee?.vacations || [];
    const vacationEntries = parseVacationEntries(existingVacations);
    
    // Check if vacation already exists for this date
    const existingIndex = vacationEntries.findIndex(entry => entry.date === dateString);
    if (existingIndex >= 0) {
      vacationEntries[existingIndex] = newEntry;
    } else {
      vacationEntries.push(newEntry);
    }

    const updatedVacations = vacationEntries.map(formatVacationEntry);
    onUpdateEmployeeVacations(parseInt(selectedEmployeeId), updatedVacations);
    
    setSelectedDate(undefined);
    setVacationType('full');
    setStartTime('09:00');
    setEndTime('17:00');
  };

  const handleRemoveVacation = (employeeId: number, vacationDate: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    const vacationEntries = parseVacationEntries(employee.vacations || []);
    const updatedEntries = vacationEntries.filter(entry => entry.date !== vacationDate);
    const updatedVacations = updatedEntries.map(formatVacationEntry);
    
    onUpdateEmployeeVacations(employeeId, updatedVacations);
  };

  const getVacationTypeLabel = (entry: VacationEntry): string => {
    switch (entry.type) {
      case 'morning':
        return 'Mattina';
      case 'afternoon':
        return 'Pomeriggio';
      case 'hours':
        return `${entry.startTime} - ${entry.endTime}`;
      default:
        return 'Giorno intero';
    }
  };

  const getVacationTypeColor = (entry: VacationEntry): string => {
    switch (entry.type) {
      case 'morning':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'afternoon':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'hours':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-red-100 border-red-300 text-red-800';
    }
  };

  const vacationEntries = selectedEmployee ? parseVacationEntries(selectedEmployee.vacations || []) : [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 px-3 gap-2 text-sm">
          <Plane className="h-4 w-4" />
          Gestisci Ferie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestione Ferie Dipendenti</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Seleziona Dipendente:</label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Scegli un dipendente" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployee && (
            <>
              <div className="space-y-4">
                <label className="block text-sm font-medium">Aggiungi Nuova Ferie:</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Data
                    </Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={it}
                      className="rounded-md border"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2">Tipo di Ferie</Label>
                      <Select value={vacationType} onValueChange={(value: 'full' | 'morning' | 'afternoon' | 'hours') => setVacationType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Giorno intero</SelectItem>
                          <SelectItem value="morning">Solo mattina</SelectItem>
                          <SelectItem value="afternoon">Solo pomeriggio</SelectItem>
                          <SelectItem value="hours">Ore specifiche</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {vacationType === 'hours' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-sm font-medium mb-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Dalle
                          </Label>
                          <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Alle
                          </Label>
                          <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={handleAddVacation} 
                      disabled={!selectedDate}
                      className="w-full"
                    >
                      Aggiungi Ferie
                    </Button>
                  </div>
                </div>
              </div>

              {vacationEntries.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Ferie Esistenti:</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {vacationEntries.map((entry, index) => (
                      <div key={`${entry.date}-${index}`} className={`flex items-center justify-between p-3 rounded border ${getVacationTypeColor(entry)}`}>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {format(new Date(entry.date), 'dd MMMM yyyy', { locale: it })}
                          </span>
                          <span className="text-xs opacity-75">
                            {getVacationTypeLabel(entry)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVacation(selectedEmployee.id, entry.date)}
                          className="text-current hover:bg-black/10 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VacationManager;
