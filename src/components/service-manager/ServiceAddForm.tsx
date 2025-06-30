
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface ServiceAddFormProps {
  selectedCategory: 'Parrucchiere' | 'Estetista';
  newService: string;
  onCategoryChange: (category: 'Parrucchiere' | 'Estetista') => void;
  onServiceChange: (service: string) => void;
  onAddService: () => void;
}

const ServiceAddForm: React.FC<ServiceAddFormProps> = ({
  selectedCategory,
  newService,
  onCategoryChange,
  onServiceChange,
  onAddService
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Aggiungi nuovo servizio:</label>
      <div className="flex gap-2">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Parrucchiere">Parrucchiere</SelectItem>
            <SelectItem value="Estetista">Estetista</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Nome servizio"
          value={newService}
          onChange={(e) => onServiceChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAddService()}
          className="flex-1"
        />
        <Button onClick={onAddService} disabled={!newService.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ServiceAddForm;
