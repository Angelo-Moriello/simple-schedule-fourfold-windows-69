
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { ServiceCategory } from '@/types/appointment';

interface ServiceManagerProps {
  serviceCategories: Record<'Parrucchiere' | 'Estetista', ServiceCategory>;
  onUpdateServices: (categories: Record<'Parrucchiere' | 'Estetista', ServiceCategory>) => void;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({
  serviceCategories,
  onUpdateServices
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'Parrucchiere' | 'Estetista'>('Parrucchiere');
  const [newService, setNewService] = useState('');

  const handleAddService = () => {
    if (newService.trim()) {
      const updatedCategories = {
        ...serviceCategories,
        [selectedCategory]: {
          ...serviceCategories[selectedCategory],
          services: [...serviceCategories[selectedCategory].services, newService.trim()]
        }
      };
      onUpdateServices(updatedCategories);
      setNewService('');
    }
  };

  const handleRemoveService = (categoryKey: 'Parrucchiere' | 'Estetista', serviceToRemove: string) => {
    const updatedCategories = {
      ...serviceCategories,
      [categoryKey]: {
        ...serviceCategories[categoryKey],
        services: serviceCategories[categoryKey].services.filter(service => service !== serviceToRemove)
      }
    };
    onUpdateServices(updatedCategories);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm">
          <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Gestisci</span> Servizi
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestione Servizi</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <Select
              value={selectedCategory}
              onValueChange={(value: 'Parrucchiere' | 'Estetista') => setSelectedCategory(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Parrucchiere">Parrucchiere</SelectItem>
                <SelectItem value="Estetista">Estetista</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Input
                placeholder="Nome nuovo servizio"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                className="flex-1"
              />
              <Button onClick={handleAddService}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {Object.entries(serviceCategories).map(([categoryKey, category]) => (
            <div key={categoryKey} className="space-y-3">
              <h4 className="font-medium text-lg">{category.name}</h4>
              <div className="grid gap-2">
                {category.services.map((service) => (
                  <div key={service} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <span>{service}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveService(categoryKey as 'Parrucchiere' | 'Estetista', service)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
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

export default ServiceManager;
