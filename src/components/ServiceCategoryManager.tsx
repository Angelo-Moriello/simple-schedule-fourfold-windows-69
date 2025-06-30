
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ServiceCategory } from '@/types/appointment';
import { toast } from 'sonner';
import { loadStoredServices, saveServicesToStorage } from './service-manager/ServiceStorageUtils';
import ServiceAddForm from './service-manager/ServiceAddForm';
import ServiceCategoryList from './service-manager/ServiceCategoryList';

interface ServiceCategoryManagerProps {
  onUpdateServiceCategories?: (categories: Record<'Parrucchiere' | 'Estetista', ServiceCategory>) => void;
}

const ServiceCategoryManager: React.FC<ServiceCategoryManagerProps> = ({
  onUpdateServiceCategories
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'Parrucchiere' | 'Estetista'>('Parrucchiere');
  const [newService, setNewService] = useState('');
  const [customCategories, setCustomCategories] = useState(loadStoredServices);

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
      saveServicesToStorage(updatedCategories);
      onUpdateServiceCategories?.(updatedCategories);
      setNewService('');
      toast.success(`Servizio "${newService.trim()}" aggiunto con successo!`);
    }
  };

  const handleRemoveService = (category: 'Parrucchiere' | 'Estetista', serviceIndex: number) => {
    const serviceToRemove = customCategories[category].services[serviceIndex];
    const updatedCategories = {
      ...customCategories,
      [category]: {
        ...customCategories[category],
        services: customCategories[category].services.filter((_, index) => index !== serviceIndex)
      }
    };
    
    setCustomCategories(updatedCategories);
    saveServicesToStorage(updatedCategories);
    onUpdateServiceCategories?.(updatedCategories);
    toast.success(`Servizio "${serviceToRemove}" rimosso con successo!`);
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
          <span className="text-xs sm:text-sm">Servizi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestione Tipi di Servizio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <ServiceAddForm
            selectedCategory={selectedCategory}
            newService={newService}
            onCategoryChange={setSelectedCategory}
            onServiceChange={setNewService}
            onAddService={handleAddService}
          />

          <ServiceCategoryList
            categories={customCategories}
            onRemoveService={handleRemoveService}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceCategoryManager;
