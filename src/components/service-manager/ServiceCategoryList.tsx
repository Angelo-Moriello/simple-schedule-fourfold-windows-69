
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ServiceCategory } from '@/types/appointment';

interface ServiceCategoryListProps {
  categories: Record<'Parrucchiere' | 'Estetista', ServiceCategory>;
  onRemoveService: (category: 'Parrucchiere' | 'Estetista', serviceIndex: number) => void;
}

const ServiceCategoryList: React.FC<ServiceCategoryListProps> = ({
  categories,
  onRemoveService
}) => {
  return (
    <>
      {(['Parrucchiere', 'Estetista'] as const).map((categoryKey) => {
        const category = categories[categoryKey];
        return (
          <div key={categoryKey} className="space-y-3">
            <h3 className="font-semibold text-lg">{category.name} ({category.services.length} servizi)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {category.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                  <span className="text-sm">{service}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveService(categoryKey, index)}
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
    </>
  );
};

export default ServiceCategoryList;
