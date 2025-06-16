
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Check, X } from 'lucide-react';
import { Employee } from '@/types/appointment';

interface EmployeeNameEditorProps {
  employee: Employee;
  onUpdateName: (employeeId: number, newName: string) => void;
}

const EmployeeNameEditor: React.FC<EmployeeNameEditorProps> = ({
  employee,
  onUpdateName
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(employee.name);

  const handleSave = () => {
    if (newName.trim()) {
      onUpdateName(employee.id, newName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNewName(employee.name);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="text-center text-lg font-medium"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <Button variant="ghost" size="sm" onClick={handleSave}>
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-lg text-center font-medium text-gray-700">
        {employee.name}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default EmployeeNameEditor;
