
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Trash2, Download, Upload } from 'lucide-react';
import { Employee } from '@/types/appointment';

interface EmployeeManagerProps {
  employees: Employee[];
  onAddEmployee: (name: string) => void;
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

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      onAddEmployee(newEmployeeName.trim());
      setNewEmployeeName('');
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
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          Gestisci Dipendenti
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gestione Dipendenti</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome nuovo dipendente"
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEmployee()}
            />
            <Button onClick={handleAddEmployee}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Dipendenti esistenti:</h4>
            {employees.map(employee => (
              <div key={employee.id} className="flex items-center justify-between p-2 border rounded">
                <span>{employee.name}</span>
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
