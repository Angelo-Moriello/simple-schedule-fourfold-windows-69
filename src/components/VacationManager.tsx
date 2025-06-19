
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plane, Trash2 } from 'lucide-react';
import { Employee } from '@/types/appointment';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

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
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const selectedEmployee = employees.find(emp => emp.id.toString() === selectedEmployeeId);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDates(prev => {
      const dateString = format(date, 'yyyy-MM-dd');
      const existingIndex = prev.findIndex(d => format(d, 'yyyy-MM-dd') === dateString);
      
      if (existingIndex >= 0) {
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        return [...prev, date];
      }
    });
  };

  const handleSaveVacations = () => {
    if (!selectedEmployeeId) return;
    
    const vacationDates = selectedDates.map(date => format(date, 'yyyy-MM-dd'));
    const existingVacations = selectedEmployee?.vacations || [];
    const allVacations = [...new Set([...existingVacations, ...vacationDates])];
    
    onUpdateEmployeeVacations(parseInt(selectedEmployeeId), allVacations);
    setSelectedDates([]);
  };

  const handleRemoveVacation = (employeeId: number, vacationDate: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    const updatedVacations = (employee.vacations || []).filter(date => date !== vacationDate);
    onUpdateEmployeeVacations(employeeId, updatedVacations);
  };

  const getModifiers = () => {
    const vacations = selectedEmployee?.vacations || [];
    return {
      selected: selectedDates,
      vacation: vacations.map(dateStr => new Date(dateStr))
    };
  };

  const getModifiersStyles = () => {
    return {
      vacation: { 
        backgroundColor: '#fecaca', 
        color: '#dc2626',
        fontWeight: 'bold' 
      }
    };
  };

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
              <div>
                <label className="block text-sm font-medium mb-2">Seleziona Giorni di Ferie:</label>
                <div className="bg-white rounded-lg p-4 border">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => setSelectedDates(dates || [])}
                    locale={it}
                    modifiers={getModifiers()}
                    modifiersStyles={getModifiersStyles()}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSaveVacations} disabled={selectedDates.length === 0}>
                    Aggiungi Ferie Selezionate
                  </Button>
                </div>
              </div>

              {selectedEmployee.vacations && selectedEmployee.vacations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Ferie Esistenti:</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedEmployee.vacations.map(vacationDate => (
                      <div key={vacationDate} className="flex items-center justify-between bg-red-50 p-2 rounded border border-red-200">
                        <span className="text-sm">
                          {format(new Date(vacationDate), 'dd MMMM yyyy', { locale: it })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVacation(selectedEmployee.id, vacationDate)}
                          className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
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
