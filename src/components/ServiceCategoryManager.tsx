import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { ServiceCategory } from '@/types/appointment';
import { toast } from 'sonner';

interface ServiceCategoryManagerProps {
  onUpdateServiceCategories?: (categories: Record<'Parrucchiere' | 'Estetista', ServiceCategory>) => void;
}

const ServiceCategoryManager: React.FC<ServiceCategoryManagerProps> = ({
  onUpdateServiceCategories
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'Parrucchiere' | 'Estetista'>('Parrucchiere');
  const [newService, setNewService] = useState('');
  
  // Load services from localStorage or use defaults
  const loadStoredServices = (): Record<'Parrucchiere' | 'Estetista', ServiceCategory> => {
    try {
      // Verifica tutti i possibili backup nel localStorage
      const stored = localStorage.getItem('services');
      const backup1 = localStorage.getItem('services_backup');
      const backup2 = localStorage.getItem('customServices');
      
      console.log('DEBUG - Tentativo recupero servizi:', {
        stored: stored ? JSON.parse(stored) : null,
        backup1: backup1 ? JSON.parse(backup1) : null,
        backup2: backup2 ? JSON.parse(backup2) : null
      });
      
      // Prova prima con il backup
      let servicesToLoad = null;
      if (stored) {
        try {
          servicesToLoad = JSON.parse(stored);
        } catch (e) {
          console.error('Errore parsing servizi principali:', e);
        }
      }
      
      if (!servicesToLoad && backup1) {
        try {
          servicesToLoad = JSON.parse(backup1);
          console.log('Usando backup1');
        } catch (e) {
          console.error('Errore parsing backup1:', e);
        }
      }
      
      if (!servicesToLoad && backup2) {
        try {
          servicesToLoad = JSON.parse(backup2);
          console.log('Usando backup2');
        } catch (e) {
          console.error('Errore parsing backup2:', e);
        }
      }
      
      if (servicesToLoad) {
        console.log('Servizi recuperati:', servicesToLoad);
        // Validate the structure
        if (servicesToLoad.Parrucchiere && servicesToLoad.Estetista && 
            Array.isArray(servicesToLoad.Parrucchiere.services) && 
            Array.isArray(servicesToLoad.Estetista.services)) {
          return servicesToLoad;
        }
      }
    } catch (error) {
      console.error('Errore nel parsing dei servizi:', error);
    }
    
    // Return defaults with some common services that might have been added
    const defaultServices = {
      Parrucchiere: {
        name: 'Parrucchiere',
        services: [
          'Piega', 
          'Colore', 
          'Taglio', 
          'Colpi di sole', 
          'Trattamento Capelli',
          'Permanente',
          'Stiratura',
          'Extension',
          'Balayage',
          'Shatush'
        ]
      },
      Estetista: {
        name: 'Estetista',
        services: [
          'Pulizia Viso', 
          'Manicure', 
          'Pedicure', 
          'Massaggio', 
          'Depilazione', 
          'Trattamento Corpo',
          'Ricostruzione Unghie',
          'Semipermanente',
          'Trattamento Viso',
          'Ceretta'
        ]
      }
    };
    console.log('Usando servizi di default espansi:', defaultServices);
    return defaultServices;
  };

  const [customCategories, setCustomCategories] = useState(loadStoredServices);

  // Save services to localStorage with multiple backups
  const saveServicesToStorage = (categories: Record<'Parrucchiere' | 'Estetista', ServiceCategory>) => {
    try {
      const dataToSave = JSON.stringify(categories);
      
      // Salva in multiple locations for backup
      localStorage.setItem('services', dataToSave);
      localStorage.setItem('services_backup', dataToSave);
      localStorage.setItem('customServices', dataToSave);
      localStorage.setItem('services_timestamp', new Date().toISOString());
      
      console.log('Servizi salvati in localStorage con backup:', categories);
    } catch (error) {
      console.error('Errore nel salvare i servizi:', error);
      toast.error('Errore nel salvare i servizi');
    }
  };

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

          {(['Parrucchiere', 'Estetista'] as const).map((categoryKey) => {
            const category = customCategories[categoryKey];
            return (
              <div key={categoryKey} className="space-y-3">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                      <span className="text-sm">{service}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveService(categoryKey, index)}
                        className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceCategoryManager;
