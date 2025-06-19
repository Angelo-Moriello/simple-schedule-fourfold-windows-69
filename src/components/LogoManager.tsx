
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Image } from 'lucide-react';
import { toast } from 'sonner';

const LogoManager: React.FC = () => {
  const [logoSettings, setLogoSettings] = useState(() => {
    const stored = localStorage.getItem('logoSettings');
    return stored ? JSON.parse(stored) : {
      size: 80,
      position: 'center'
    };
  });

  const handleSaveSettings = () => {
    localStorage.setItem('logoSettings', JSON.stringify(logoSettings));
    toast.success('Impostazioni logo salvate!');
    // Forza il ricaricamento della pagina per applicare le modifiche
    window.location.reload();
  };

  const positions = [
    { value: 'left', label: 'Sinistra' },
    { value: 'center', label: 'Centro' },
    { value: 'right', label: 'Destra' }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 px-3 gap-2 text-sm">
          <Image className="h-4 w-4" />
          Logo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestione Logo Aziendale</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Dimensione: {logoSettings.size}px</Label>
            <Slider
              value={[logoSettings.size]}
              onValueChange={(value) => setLogoSettings({ ...logoSettings, size: value[0] })}
              min={40}
              max={120}
              step={5}
              className="w-full"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Posizione</Label>
            <Select
              value={logoSettings.position}
              onValueChange={(value) => setLogoSettings({ ...logoSettings, position: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positions.map(pos => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <Button onClick={handleSaveSettings} className="w-full">
              Salva Impostazioni
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoManager;
