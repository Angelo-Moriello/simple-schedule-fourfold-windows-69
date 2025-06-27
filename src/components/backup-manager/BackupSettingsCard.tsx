
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface BackupSettingsCardProps {
  autoBackupEnabled: boolean;
  backupInterval: string;
  onAutoBackupToggle: (enabled: boolean) => void;
  onIntervalChange: (value: string) => void;
}

const BackupSettingsCard: React.FC<BackupSettingsCardProps> = ({
  autoBackupEnabled,
  backupInterval,
  onAutoBackupToggle,
  onIntervalChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Backup Automatico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-backup" className="text-sm">
            Abilita backup automatico
          </Label>
          <Switch
            id="auto-backup"
            checked={autoBackupEnabled}
            onCheckedChange={onAutoBackupToggle}
          />
        </div>
        
        {autoBackupEnabled && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="interval" className="text-sm">
                Frequenza backup (minuti)
              </Label>
              <Select value={backupInterval} onValueChange={onIntervalChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Ogni 15 minuti</SelectItem>
                  <SelectItem value="30">Ogni 30 minuti</SelectItem>
                  <SelectItem value="60">Ogni ora</SelectItem>
                  <SelectItem value="120">Ogni 2 ore</SelectItem>
                  <SelectItem value="360">Ogni 6 ore</SelectItem>
                  <SelectItem value="720">Ogni 12 ore</SelectItem>
                  <SelectItem value="1440">Ogni giorno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 I file verranno scaricati automaticamente nella cartella Download del tuo browser
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackupSettingsCard;
