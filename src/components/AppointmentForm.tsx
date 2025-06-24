
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Appointment, Employee } from '@/types/appointment';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { addClientToSupabase, loadClientsFromSupabase } from '@/utils/clientStorage';
import AppointmentFormFields from './appointment-form/AppointmentFormFields';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  addAppointment?: (appointment: Appointment) => void;
  updateAppointment?: (appointment: Appointment) => void;
  employeeId: number | null;
  time: string | null;
  date: Date;
  appointmentToEdit: Appointment | null;
  employees: Employee[];
}

const appointmentColors = [
  { label: 'Blu', value: 'bg-blue-100 border-blue-300 text-blue-800' },
  { label: 'Verde', value: 'bg-green-100 border-green-300 text-green-800' },
  { label: 'Giallo', value: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { label: 'Rosso', value: 'bg-red-100 border-red-300 text-red-800' },
  { label: 'Viola', value: 'bg-purple-100 border-purple-300 text-purple-800' },
  { label: 'Rosa', value: 'bg-pink-100 border-pink-300 text-pink-800' },
  { label: 'Arancione', value: 'bg-orange-100 border-orange-300 text-orange-800' },
  { label: 'Grigio', value: 'bg-gray-100 border-gray-300 text-gray-800' }
];

const generateTimeSlots = () => {
  const slots = [];
  for (let i = 8; i <= 19; i++) {
    slots.push(`${String(i).padStart(2, '0')}:00`);
    slots.push(`${String(i).padStart(2, '0')}:30`);
  }
  return slots;
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  addAppointment,
  updateAppointment,
  employeeId,
  time,
  date,
  appointmentToEdit,
  employees
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    time: '',
    title: '',
    client: '',
    duration: '30',
    notes: '',
    email: '',
    phone: '',
    color: appointmentColors[0].value,
    serviceType: '',
    clientId: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeSlots = generateTimeSlots();

  // Load stored services from localStorage
  const getStoredServices = () => {
    try {
      const stored = localStorage.getItem('services');
      return stored ? JSON.parse(stored) : {
        Parrucchiere: ['Piega', 'Colore', 'Taglio', 'Colpi di sole', 'Trattamento Capelli'],
        Estetista: ['Pulizia Viso', 'Manicure', 'Pedicure', 'Massaggio', 'Depilazione', 'Trattamento Corpo']
      };
    } catch {
      return {
        Parrucchiere: ['Piega', 'Colore', 'Taglio', 'Colpi di sole', 'Trattamento Capelli'],
        Estetista: ['Pulizia Viso', 'Manicure', 'Pedicure', 'Massaggio', 'Depilazione', 'Trattamento Corpo']
      };
    }
  };

  const serviceCategories = getStoredServices();

  // Reset form when dialog opens/closes
  useEffect(() => {
    console.log('DEBUG - Dialog state changed:', { isOpen, appointmentToEdit });
    
    if (!isOpen) {
      // Reset form when dialog closes
      setFormData({
        employeeId: '',
        time: '',
        title: '',
        client: '',
        duration: '30',
        notes: '',
        email: '',
        phone: '',
        color: appointmentColors[0].value,
        serviceType: '',
        clientId: ''
      });
    }
  }, [isOpen]);

  // Load appointment data when editing
  useEffect(() => {
    console.log('DEBUG - AppointmentForm data loading effect:', {
      isOpen,
      appointmentToEdit: appointmentToEdit ? {
        id: appointmentToEdit.id,
        client: appointmentToEdit.client,
        email: appointmentToEdit.email,
        phone: appointmentToEdit.phone,
        employeeId: appointmentToEdit.employeeId,
        time: appointmentToEdit.time,
        serviceType: appointmentToEdit.serviceType,
        clientId: appointmentToEdit.clientId
      } : null,
      employeeId,
      time
    });

    if (isOpen) {
      if (appointmentToEdit) {
        console.log('DEBUG - Caricamento dati appuntamento da modificare completo:', appointmentToEdit);
        
        const newFormData = {
          employeeId: appointmentToEdit.employeeId?.toString() || '',
          time: appointmentToEdit.time || '',
          title: appointmentToEdit.title || '',
          client: appointmentToEdit.client || '',
          duration: appointmentToEdit.duration?.toString() || '30',
          notes: appointmentToEdit.notes || '',
          email: appointmentToEdit.email || '',
          phone: appointmentToEdit.phone || '',
          color: appointmentToEdit.color || appointmentColors[0].value,
          serviceType: appointmentToEdit.serviceType || '',
          clientId: appointmentToEdit.clientId || ''
        };
        
        console.log('DEBUG - Dati del form impostati per modifica:', newFormData);
        setFormData(newFormData);
      } else {
        console.log('DEBUG - Inizializzazione form nuovo appuntamento');
        setFormData({
          employeeId: employeeId?.toString() || '',
          time: time || '',
          title: '',
          client: '',
          duration: '30',
          notes: '',
          email: '',
          phone: '',
          color: appointmentColors[0].value,
          serviceType: '',
          clientId: ''
        });
      }
    }
  }, [isOpen, appointmentToEdit, employeeId, time]);

  // Debug: mostra quando formData cambia
  useEffect(() => {
    console.log('DEBUG - FormData aggiornato in AppointmentForm:', formData);
  }, [formData]);

  const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employeeId));
  const availableServices = selectedEmployee && serviceCategories[selectedEmployee.specialization] 
    ? serviceCategories[selectedEmployee.specialization]
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('DEBUG - Submit con formData:', formData);
    
    if (!formData.client.trim()) {
      toast.error('Il nome del cliente è obbligatorio');
      return;
    }

    if (!formData.serviceType.trim()) {
      toast.error('Il tipo di servizio è obbligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      
      let finalClientId = formData.clientId;
      
      // Solo se non stiamo modificando un appuntamento esistente e non abbiamo già un clientId
      if (!appointmentToEdit && !finalClientId) {
        console.log('DEBUG - Tentativo di trovare o creare cliente:', {
          name: formData.client,
          email: formData.email,
          phone: formData.phone
        });
        
        const existingClients = await loadClientsFromSupabase();
        console.log('DEBUG - Clienti esistenti:', existingClients.length);
        
        let existingClient = existingClients.find(client => 
          client.name.toLowerCase().trim() === formData.client.toLowerCase().trim()
        );

        if (!existingClient && (formData.email || formData.phone)) {
          existingClient = existingClients.find(client => 
            (formData.email && client.email === formData.email) ||
            (formData.phone && client.phone === formData.phone)
          );
        }
        
        if (existingClient) {
          console.log('DEBUG - Cliente trovato:', existingClient);
          finalClientId = existingClient.id;
        } else {
          console.log('DEBUG - Creazione nuovo cliente');
          try {
            const newClientData = {
              name: formData.client.trim(),
              email: formData.email?.trim() || undefined,
              phone: formData.phone?.trim() || undefined,
              notes: undefined
            };
            
            const newClient = await addClientToSupabase(newClientData);
            console.log('DEBUG - Nuovo cliente creato:', newClient);
            finalClientId = newClient.id;
            toast.success('Nuovo cliente creato con successo');
          } catch (clientError) {
            console.error('DEBUG - Errore nella creazione del cliente:', clientError);
            toast.error('Errore nella creazione del cliente');
            return;
          }
        }
      }

      const appointmentData: Appointment = {
        id: appointmentToEdit?.id || generateUUID(),
        employeeId: parseInt(formData.employeeId),
        date: format(date, 'yyyy-MM-dd'),
        time: formData.time,
        title: formData.title.trim(),
        client: formData.client.trim(),
        duration: parseInt(formData.duration),
        notes: formData.notes.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        color: formData.color,
        serviceType: formData.serviceType,
        clientId: finalClientId
      };

      console.log('DEBUG - Salvataggio appuntamento:', appointmentData);

      if (appointmentToEdit && updateAppointment) {
        await updateAppointment(appointmentData);
        toast.success('Appuntamento modificato con successo!');
      } else if (addAppointment) {
        await addAppointment(appointmentData);
        toast.success('Appuntamento creato con successo!');
      }

      onClose();
    } catch (error) {
      console.error('Errore nell\'operazione:', error);
      toast.error('Errore nell\'operazione');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCalendarSync = () => {
    try {
      const startDate = new Date(`${format(date, 'yyyy-MM-dd')}T${formData.time}:00`);
      const endDate = new Date(startDate.getTime() + parseInt(formData.duration) * 60000);
      
      const title = formData.title || `${formData.serviceType} - ${formData.client}`;
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Cliente: ${formData.client}\nServizio: ${formData.serviceType}\nEmail: ${formData.email}\nTelefono: ${formData.phone}\nNote: ${formData.notes}`)}&location=${encodeURIComponent('Studio')}`;
      
      window.open(googleCalendarUrl, '_blank');
    } catch (error) {
      console.error('Error generating Google Calendar link:', error);
      toast.error('Errore nella generazione del link calendario');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl sm:rounded-3xl">
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {appointmentToEdit ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <AppointmentFormFields
            formData={formData}
            setFormData={setFormData}
            employees={employees}
            timeSlots={timeSlots}
            appointmentColors={appointmentColors}
            availableServices={availableServices}
            selectedEmployee={selectedEmployee}
            appointmentToEdit={appointmentToEdit}
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 sm:pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-6 sm:px-8 rounded-xl border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Annulla
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvataggio...' : (appointmentToEdit ? 'Salva Modifiche' : 'Crea Appuntamento')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;
