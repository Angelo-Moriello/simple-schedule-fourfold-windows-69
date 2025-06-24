
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User } from 'lucide-react';

interface ClientSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  uniqueClients: string[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
}

const ClientSearchBar: React.FC<ClientSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  uniqueClients,
  showSuggestions,
  setShowSuggestions,
}) => {
  return (
    <div className="relative w-full">
      <Card className="relative">
        <div className="p-1">
          <div className="flex items-center gap-2 px-3 py-2">
            <User className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cerca per nome cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="border-0 shadow-none focus-visible:ring-0 text-base"
            />
          </div>
          
          {/* Suggestions dropdown */}
          {showSuggestions && uniqueClients.length > 0 && searchTerm.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {uniqueClients.slice(0, 10).map((client, index) => (
                <button
                  key={`suggestion-${index}-${client}`}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  onClick={() => {
                    setSearchTerm(client);
                    setShowSuggestions(false);
                  }}
                >
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{client}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ClientSearchBar;
