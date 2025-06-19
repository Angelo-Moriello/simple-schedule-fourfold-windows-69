
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Printer } from 'lucide-react';

interface PrintOptionsProps {
  onPrint: (options: PrintOptions) => void;
  children?: React.ReactNode;
}

export interface PrintOptions {
  includeSummary: boolean;
  includeChart: boolean;
  includeServiceDetails: boolean;
  includeEmployeeStats: boolean;
  includeClientDetails: boolean;
}

const PrintOptions = ({ onPrint, children }: PrintOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<PrintOptions>({
    includeSummary: true,
    includeChart: true,
    includeServiceDetails: true,
    includeEmployeeStats: true,
    includeClientDetails: false
  });

  const handlePrint = () => {
    onPrint(options);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 h-10 sm:h-12 px-4 sm:px-6">
            <Printer className="h-4 w-4 mr-2" />
            Stampa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Opzioni di Stampa</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cosa vuoi includere nella stampa?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="summary"
                checked={options.includeSummary}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, includeSummary: Boolean(checked) }))
                }
              />
              <label htmlFor="summary" className="text-sm font-medium">
                Riepilogo generale
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="chart"
                checked={options.includeChart}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, includeChart: Boolean(checked) }))
                }
              />
              <label htmlFor="chart" className="text-sm font-medium">
                Grafico distribuzione servizi
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="serviceDetails"
                checked={options.includeServiceDetails}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, includeServiceDetails: Boolean(checked) }))
                }
              />
              <label htmlFor="serviceDetails" className="text-sm font-medium">
                Dettaglio servizi
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="employeeStats"
                checked={options.includeEmployeeStats}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, includeEmployeeStats: Boolean(checked) }))
                }
              />
              <label htmlFor="employeeStats" className="text-sm font-medium">
                Statistiche dipendenti
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clientDetails"
                checked={options.includeClientDetails}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, includeClientDetails: Boolean(checked) }))
                }
              />
              <label htmlFor="clientDetails" className="text-sm font-medium">
                Dettagli clienti
              </label>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Stampa
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default PrintOptions;
