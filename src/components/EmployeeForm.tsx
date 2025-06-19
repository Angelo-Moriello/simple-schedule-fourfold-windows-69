
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types/appointment';
import { User, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  employees: Employee[];
}

const employeeColors = [
  { label: 'Blu', value: 'bg-blue-100 border-blue-300 text-blue-800' },
  { label: 'Verde', value: 'bg-green-100 border-green-300 text-green-800' },
  { label: 'Giallo', value: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { label: 'Rosso', value: 'bg-red-100 border-red-300 text-red-800' },
  { label: 'Viola', value: 'bg-purple-100 border-purple-300 text-purple-800' },
  { label: 'Rosa', value: 'bg-pink-100 border-pink-300 text-pink-800' },
];

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  isOpen,
  onClose,
  addEmployee,
  updateEmployee,
  employees
}) => {
  const [formData, setFormData] = useState({
    name: '',
    specialization: 'Parrucchiere' as 'Parrucchiere' | 'Estetista',
    color: employeeColors[0].value
  });
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Il nome del dipendente è obbligatorio');
      return;
    }

    if (editingEmployee) {
      updateEmployee({
        id: editingEmployee.id,
        name: formData.name,
        specialization: formData.specialization,
        color: formData.color,
        vacations: editingEmployee.vacations || []
      });
    } else {
      const newId = employees.length > 0 ? Math.max(...employees.map(emp => emp.id)) + 1 : 1;
      addEmployee({
        id: newId,
        name: formData.name,
        specialization: formData.specialization,
        color: formData.color,
        vacations: []
      });
    }

    setFormData({
      name: '',
      specialization: 'Parrucchiere',
      color: employeeColors[0].value
    });
    setEditingEmployee(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {editingEmployee ? 'Modifica Dipendente' : 'Nuovo Dipendente'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4" />
              Nome Dipendente <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome del dipendente"
              className="h-10 rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization" className="flex items-center gap-2 text-sm font-semibold">
              Specializzazione <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.specialization}
              onValueChange={(value) => setFormData({ ...formData, specialization: value as 'Parrucchiere' | 'Estetista' })}
            >
              <SelectTrigger className="h-10 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Parrucchiere">Parrucchiere</SelectItem>
                <SelectItem value="Estetista">Estetista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="flex items-center gap-2 text-sm font-semibold">
              <Palette className="h-4 w-4" />
              Colore Etichetta
            </Label>
            <Select
              value={formData.color}
              onValueChange={(value) => setFormData({ ...formData, color: value })}
            >
              <SelectTrigger className="h-10 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {employeeColors.map(color => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${color.value}`}></div>
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-4">
            <h3 className="font-semibold text-base">Dipendenti Esistenti</h3>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {employees.map(employee => (
                <div key={employee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${employee.color}`}></div>
                    <span className="text-sm">{employee.name} ({employee.specialization})</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingEmployee(employee);
                      setFormData({
                        name: employee.name,
                        specialization: employee.specialization,
                        color: employee.color
                      });
                    }}
                  >
                    Modifica
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto h-10 px-6 rounded-xl"
            >
              Annulla
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto h-10 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              {editingEmployee ? 'Salva Modifiche' : 'Crea Dipendente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeForm;
