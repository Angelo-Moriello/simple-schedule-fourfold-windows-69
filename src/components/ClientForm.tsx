
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User, Mail, Phone, FileText } from 'lucide-react';
import { addClientToSupabase, loadClientsFromSupabase } from '@/utils/clientStorage';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onClientAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Il nome del cliente è obbligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check for existing clients with the same name
      console.log('DEBUG - Controllo clienti esistenti per nome:', formData.name.trim());
      const existingClients = await loadClientsFromSupabase();
      
      const duplicateClient = existingClients.find(client => 
        client.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      );
      
      if (duplicateClient) {
        console.log('DEBUG - Cliente duplicato trovato:', duplicateClient);
        toast.error(`Esiste già un cliente con il nome "${formData.name.trim()}"`);
        return;
      }
      
      // Check for existing clients with the same email or phone
      if (formData.email.trim()) {
        const emailDuplicate = existingClients.find(client => 
          client.email && client.email.toLowerCase().trim() === formData.email.toLowerCase().trim()
        );
        if (emailDuplicate) {
          console.log('DEBUG - Cliente con email duplicata trovato:', emailDuplicate);
          toast.error(`Esiste già un cliente con l'email "${formData.email.trim()}"`);
          return;
        }
      }
      
      if (formData.phone.trim()) {
        const phoneDuplicate = existingClients.find(client => 
          client.phone && client.phone.trim() === formData.phone.trim()
        );
        if (phoneDuplicate) {
          console.log('DEBUG - Cliente con telefono duplicato trovato:', phoneDuplicate);
          toast.error(`Esiste già un cliente con il telefono "${formData.phone.trim()}"`);
          return;
        }
      }
      
      await addClientToSupabase({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        notes: formData.notes.trim() || undefined
      });
      
      setFormData({ name: '', email: '', phone: '', notes: '' });
      onClientAdded();
    } catch (error) {
      console.error('Errore nell\'aggiunta del cliente:', error);
      toast.error('Errore nell\'aggiungere il cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', notes: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md z-[60] max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-green-100 rounded-full p-2">
              <User className="h-4 w-4 text-green-600" />
            </div>
            Nuovo Cliente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome completo del cliente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@esempio.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefono
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+39 123 456 7890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Note
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note aggiuntive sul cliente..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Aggiunta...' : 'Aggiungi Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
