
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

interface ClientSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClient: () => void;
}

const ClientSearchBar: React.FC<ClientSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onAddClient
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Cerca cliente..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 text-sm"
        />
      </div>
      <Button
        onClick={onAddClient}
        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Nuovo Cliente</span>
        <span className="sm:hidden">Nuovo</span>
      </Button>
    </div>
  );
};

export default ClientSearchBar;
