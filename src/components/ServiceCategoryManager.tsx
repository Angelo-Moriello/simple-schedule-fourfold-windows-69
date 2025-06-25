
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { serviceCategories } from '@/types/appointment';

interface ServiceCategoryManagerProps {
  onUpdateServiceCategories?: (categories: typeof serviceCategories) => void;
}

const ServiceCategoryManager: React.FC<ServiceCategoryManagerProps> = ({
  onUpdateServiceCategories
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'Parrucchiere' | 'Estetista'>('Parrucchiere');
  const [newService, setNewService] = useState('');
  const [customCategories, setCustomCategories] = useState(serviceCategories);

  const handleAddService = () => {
    if (newService.trim()) {
      const updatedCategories = {
        ...customCategories,
        [selectedCategory]: {
          ...customCategories[selectedCategory],
          services: [...customCategories[selectedCategory].services, newService.trim()]
        }
      };
      setCustomCategories(updatedCategories);
      onUpdateServiceCategories?.(updatedCategories);
      setNewService('');
    }
  };

  const handleRemoveService = (category: 'Parrucchiere' | 'Estetista', serviceIndex: number) => {
    const updatedCategories = {
      ...customCategories,
      [category]: {
        ...customCategories[category],
        services: customCategories[category].services.filter((_, index) => index !== serviceIndex)
      }
    };
    setCustomCategories(updatedCategories);
    onUpdateServiceCategories?.(updatedCategories);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary"
          size="lg"
          className="w-full gap-2"
        >
          <span className="text-base">⚙️</span>
          <span className="hidden sm:inline">Servizi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestione Tipi di Servizio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Aggiungi nuovo servizio:</label>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={(value: 'Parrucchiere' | 'Estetista') => setSelectedCategory(value)}>
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
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                className="flex-1"
              />
              <Button onClick={handleAddService} disabled={!newService.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {Object.entries(customCategories).map(([categoryKey, category]) => (
            <div key={categoryKey} className="space-y-3">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                    <span className="text-sm">{service}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveService(categoryKey as 'Parrucchiere' | 'Estetista', index)}
                      className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceCategoryManager;
