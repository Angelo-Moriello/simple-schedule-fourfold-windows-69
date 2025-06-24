
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, FileText, Edit } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientInfoTabProps {
  client: Client;
  onUpdate: (client: Client) => void;
  isSubmitting: boolean;
}

const ClientInfoTab: React.FC<ClientInfoTabProps> = ({
  client,
  onUpdate,
  isSubmitting
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(client);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    await onUpdate({
      ...formData,
      name: formData.name.trim(),
      email: formData.email?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      notes: formData.notes?.trim() || undefined
    });
    
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome *
          </Label>
          <Input
            id="edit-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Telefono
          </Label>
          <Input
            id="edit-phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Note
          </Label>
          <Textarea
            id="edit-notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setIsEditing(false);
              setFormData(client);
            }}
          >
            Annulla
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          size="sm"
        >
          <Edit className="h-4 w-4 mr-1" />
          Modifica
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <p className="text-sm text-gray-600">{client.email || 'Non specificata'}</p>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Phone className="h-4 w-4" />
            Telefono
          </Label>
          <p className="text-sm text-gray-600">{client.phone || 'Non specificato'}</p>
        </div>
      </div>
      
      {client.notes && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            Note
          </Label>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ClientInfoTab;
