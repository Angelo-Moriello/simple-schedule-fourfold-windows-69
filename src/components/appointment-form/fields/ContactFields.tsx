
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, Phone } from 'lucide-react';

interface ContactFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  appointmentToEdit: any;
}

const ContactFields: React.FC<ContactFieldsProps> = ({
  formData,
  setFormData,
  appointmentToEdit
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Mail className="h-4 w-4" />
          Email Cliente
          {!appointmentToEdit && (
            <span className="text-xs text-blue-600 font-normal">(collegherà il cliente esistente o ne creerà uno nuovo)</span>
          )}
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@esempio.com"
          className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Phone className="h-4 w-4" />
          Telefono Cliente
          {!appointmentToEdit && (
            <span className="text-xs text-blue-600 font-normal">(collegherà il cliente esistente o ne crearà uno nuovo)</span>
          )}
        </Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+39 123 456 7890"
          className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
        />
      </div>
    </div>
  );
};

export default ContactFields;
