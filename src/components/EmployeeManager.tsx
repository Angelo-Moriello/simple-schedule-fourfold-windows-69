
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Trash2, Download, Upload } from 'lucide-react';
import { Employee } from '@/types/appointment';

interface EmployeeManagerProps {
  employees: Employee[];
  onAddEmployee: (name: string, specialization: 'Parrucchiere' | 'Estetista') => void;
  onRemoveEmployee: (employeeId: number) => void;
  onBackupData: () => void;
  onRestoreData: (data: any) => void;
}

const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  employees,
  onAddEmployee,
  onRemoveEmployee,
  onBackupData,
  onRestoreData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeSpecialization, setNewEmployeeSpecialization] = useState<'Parrucchiere' | 'Estetista'>('Parrucchiere');

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      onAddEmployee(newEmployeeName.trim(), newEmployeeSpecialization);
      setNewEmployeeName('');
      setNewEmployeeSpecialization('Parrucchiere');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          onRestoreData(data);
        } catch (error) {
          console.error('Error parsing backup file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm">
          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Gestisci</span> Dipendenti
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gestione Dipendenti</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Nome nuovo dipendente"
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEmployee()}
            />
            <Select
              value={newEmployeeSpecialization}
              onValueChange={(value: 'Parrucchiere' | 'Estetista') => setNewEmployeeSpecialization(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona specializzazione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Parrucchiere">Parrucchiere</SelectItem>
                <SelectItem value="Estetista">Estetista</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddEmployee} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Dipendente
            </Button>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Dipendenti esistenti:</h4>
            {employees.map(employee => (
              <div key={employee.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span className="font-medium">{employee.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({employee.specialization})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveEmployee(employee.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <h4 className="font-medium">Backup dei dati:</h4>
            <div className="flex gap-2">
              <Button onClick={onBackupData} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Scarica Backup
              </Button>
              <div className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="restore-file"
                />
                <Button asChild variant="outline" className="w-full">
                  <label htmlFor="restore-file" className="cursor-pointer flex items-center justify-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Ripristina Backup
                  </label>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeManager;
