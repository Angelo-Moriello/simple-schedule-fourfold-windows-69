
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
      <div className="flex items-center gap-2 w-full">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="text-center lg:text-center text-sm lg:text-lg font-medium flex-1 min-w-0"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <Button variant="ghost" size="sm" onClick={handleSave} className="flex-shrink-0">
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCancel} className="flex-shrink-0">
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group w-full">
      <span className="text-sm lg:text-lg text-center lg:text-center font-medium text-gray-700 flex-1 truncate">
        {employee.name}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-70 lg:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default EmployeeNameEditor;
