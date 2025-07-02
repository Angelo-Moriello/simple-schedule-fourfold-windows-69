
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Appointment } from '@/types/appointment';
import { User, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface ClientAutocompleteProps {
  formData: Appointment;
  setFormData: (data: Appointment) => void;
}

const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
  formData,
  setFormData
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load clients from Supabase
  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, email, phone')
          .order('name');

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error('Errore nel caricamento clienti:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  // Filter clients based on input
  useEffect(() => {
    if (formData.client && formData.client.length > 0) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(formData.client.toLowerCase())
      );
      setFilteredClients(filtered);
      setShowSuggestions(filtered.length > 0 && formData.client !== filtered[0]?.name);
    } else {
      setFilteredClients([]);
      setShowSuggestions(false);
    }
  }, [formData.client, clients]);

  const handleClientSelect = (client: Client) => {
    setFormData({
      ...formData,
      client: client.name,
      clientId: client.id,
      email: client.email || formData.email,
      phone: client.phone || formData.phone
    });
    setShowSuggestions(false);
  };

  const handleInputChange = (value: string) => {
    setFormData({
      ...formData,
      client: value,
      // Clear clientId if user is typing a new name
      clientId: clients.find(c => c.name === value)?.id || ''
    });
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="client" className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <User className="h-4 w-4 text-blue-600" />
        Nome Cliente <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="client"
            value={formData.client}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Cerca o inserisci nome cliente..."
            className="h-11 pl-10"
            onFocus={() => {
              if (filteredClients.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
        </div>

        {showSuggestions && filteredClients.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg">
            <CardContent className="p-0">
              <ScrollArea className="max-h-40">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium text-sm">{client.name}</div>
                        {(client.email || client.phone) && (
                          <div className="text-xs text-gray-500">
                            {client.email && <span>{client.email}</span>}
                            {client.email && client.phone && <span> • </span>}
                            {client.phone && <span>{client.phone}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientAutocomplete;
