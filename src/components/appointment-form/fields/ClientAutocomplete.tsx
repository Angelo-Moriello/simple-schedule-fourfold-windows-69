
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, ChevronDown } from 'lucide-react';
import { Client } from '@/types/client';
import { loadClientsFromSupabase } from '@/utils/clientStorage';
import { Card, CardContent } from '@/components/ui/card';

interface ClientAutocompleteProps {
  formData: any;
  setFormData: (data: any) => void;
}

const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
  formData,
  setFormData
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (formData.client && showSuggestions) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(formData.client.toLowerCase())
      ).slice(0, 5); // Mostra max 5 suggerimenti
      setFilteredClients(filtered);
    } else {
      setFilteredClients([]);
    }
  }, [formData.client, clients, showSuggestions]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const loadedClients = await loadClientsFromSupabase();
      setClients(loadedClients);
    } catch (error) {
      console.error('Errore nel caricamento clienti:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    console.log('DEBUG - Cliente selezionato:', client);
    setFormData({
      ...formData,
      client: client.name,
      email: client.email || '',
      phone: client.phone || '',
      clientId: client.id
    });
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      client: value,
      // Reset client ID se il nome viene modificato manualmente
      clientId: ''
    });
    setShowSuggestions(value.length > 0);
  };

  const handleInputFocus = () => {
    if (formData.client.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Ritarda la chiusura per permettere il click sui suggerimenti
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="client" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <User className="h-4 w-4" />
        Cliente <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <Input
          id="client"
          value={formData.client}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Inizia a digitare il nome del cliente..."
          className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors pr-10"
          required
        />
        {formData.client && (
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
        
        {showSuggestions && filteredClients.length > 0 && (
          <Card className="absolute top-full mt-1 w-full z-50 shadow-lg border border-gray-200">
            <CardContent className="p-0">
              <div className="max-h-48 overflow-y-auto">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <div className="flex gap-2 text-xs text-gray-600">
                          {client.email && <span>{client.email}</span>}
                          {client.phone && <span>{client.phone}</span>}
                        </div>
                      </div>
                      <div className="text-xs text-blue-600">Seleziona</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {showSuggestions && filteredClients.length === 0 && formData.client.length > 0 && (
          <Card className="absolute top-full mt-1 w-full z-50 shadow-lg border border-gray-200">
            <CardContent className="p-3">
              <p className="text-sm text-gray-600">
                Nessun cliente trovato. Un nuovo cliente verrà creato con questo nome.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientAutocomplete;
