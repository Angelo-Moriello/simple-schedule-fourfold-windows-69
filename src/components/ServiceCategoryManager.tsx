
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ServiceCategory } from '@/types/appointment';
import { toast } from 'sonner';
import { getStoredServices, saveServicesToStorage, setupServicesRealtimeListener } from '@/utils/serviceStorage';
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
  const [customCategories, setCustomCategories] = useState<Record<'Parrucchiere' | 'Estetista', ServiceCategory>>({
    Parrucchiere: { name: 'Parrucchiere', services: [] },
    Estetista: { name: 'Estetista', services: [] }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Carica servizi iniziali
  useEffect(() => {
    const loadInitialServices = async () => {
      setIsLoading(true);
      try {
        const services = await getStoredServices();
        setCustomCategories(services);
      } catch (error) {
        console.error('Errore caricamento servizi iniziali:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialServices();
  }, []);

  // Setup realtime listener
  useEffect(() => {
    const channel = setupServicesRealtimeListener();
    
    const handleServicesUpdated = (event: CustomEvent) => {
      console.log('ServiceCategoryManager - Ricevuto aggiornamento servizi:', event.detail);
      setCustomCategories(event.detail);
    };

    window.addEventListener('servicesUpdated', handleServicesUpdated as EventListener);

    return () => {
      window.removeEventListener('servicesUpdated', handleServicesUpdated as EventListener);
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  // Ricarica i servizi quando il dialog si apre
  useEffect(() => {
    if (isOpen) {
      const reloadServices = async () => {
        console.log('ServiceCategoryManager - Dialog aperto, ricaricando servizi');
        setIsLoading(true);
        try {
          const refreshedServices = await getStoredServices();
          setCustomCategories(refreshedServices);
        } catch (error) {
          console.error('Errore ricaricamento servizi:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      reloadServices();
    }
  }, [isOpen]);

  const handleAddService = async () => {
    if (newService.trim()) {
      setIsLoading(true);
      try {
        const updatedCategories = {
          ...customCategories,
          [selectedCategory]: {
            ...customCategories[selectedCategory],
            services: [...customCategories[selectedCategory].services, newService.trim()]
          }
        };
        
        const success = await saveServicesToStorage(updatedCategories);
        
        if (success) {
          setCustomCategories(updatedCategories);
          onUpdateServiceCategories?.(updatedCategories);
          setNewService('');
          toast.success(`Servizio "${newService.trim()}" aggiunto e sincronizzato su tutti i dispositivi!`);
        } else {
          // Fallback locale
          setCustomCategories(updatedCategories);
          onUpdateServiceCategories?.(updatedCategories);
          setNewService('');
          toast.success(`Servizio "${newService.trim()}" aggiunto localmente. Verrà sincronizzato quando possibile.`);
        }
      } catch (error) {
        console.error('Errore aggiunta servizio:', error);
        toast.error('Errore nell\'aggiungere il servizio');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveService = async (category: 'Parrucchiere' | 'Estetista', serviceIndex: number) => {
    setIsLoading(true);
    try {
      const serviceToRemove = customCategories[category].services[serviceIndex];
      const updatedCategories = {
        ...customCategories,
        [category]: {
          ...customCategories[category],
          services: customCategories[category].services.filter((_, index) => index !== serviceIndex)
        }
      };
      
      const success = await saveServicesToStorage(updatedCategories);
      
      if (success) {
        setCustomCategories(updatedCategories);
        onUpdateServiceCategories?.(updatedCategories);
        toast.success(`Servizio "${serviceToRemove}" rimosso e sincronizzato su tutti i dispositivi!`);
      } else {
        // Fallback locale
        setCustomCategories(updatedCategories);
        onUpdateServiceCategories?.(updatedCategories);
        toast.success(`Servizio "${serviceToRemove}" rimosso localmente. Verrà sincronizzato quando possibile.`);
      }
    } catch (error) {
      console.error('Errore rimozione servizio:', error);
      toast.error('Errore nella rimozione del servizio');
    } finally {
      setIsLoading(false);
    }
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
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-sm text-gray-600">Sincronizzazione in corso...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                ℹ️ I servizi vengono sincronizzati automaticamente tra tutti i tuoi dispositivi.
              </p>
            </div>
            
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceCategoryManager;
