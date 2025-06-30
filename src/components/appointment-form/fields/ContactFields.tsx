
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Mail className="h-4 w-4 text-blue-600" />
          Email Cliente
          {!appointmentToEdit && (
            <span className="text-xs text-blue-600 font-normal bg-blue-50 px-2 py-1 rounded-full">auto-link</span>
          )}
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@esempio.com"
          className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
        />
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Phone className="h-4 w-4 text-blue-600" />
          Telefono Cliente
          {!appointmentToEdit && (
            <span className="text-xs text-blue-600 font-normal bg-blue-50 px-2 py-1 rounded-full">auto-link</span>
          )}
        </Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+39 123 456 7890"
          className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
        />
      </div>
    </div>
  );
};

export default ContactFields;
