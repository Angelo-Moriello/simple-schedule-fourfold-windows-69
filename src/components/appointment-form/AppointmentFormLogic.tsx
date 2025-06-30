
import { useState, useEffect } from 'react';
import { Appointment } from '@/types/appointment';
import { toast } from 'sonner';
import { addClientToSupabase, loadClientsFromSupabase } from '@/utils/clientStorage';
import { format } from 'date-fns';

export const appointmentColors = [
  { label: 'Blu', value: 'bg-blue-100 border-blue-300 text-blue-800' },
  { label: 'Verde', value: 'bg-green-100 border-green-300 text-green-800' },
  { label: 'Giallo', value: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { label: 'Rosso', value: 'bg-red-100 border-red-300 text-red-800' },
  { label: 'Viola', value: 'bg-purple-100 border-purple-300 text-purple-800' },
  { label: 'Rosa', value: 'bg-pink-100 border-pink-300 text-pink-800' },
  { label: 'Arancione', value: 'bg-orange-100 border-orange-300 text-orange-800' },
  { label: 'Grigio', value: 'bg-gray-100 border-gray-300 text-gray-800' }
];

export const generateTimeSlots = () => {
  const slots = [];
  for (let i = 8; i <= 19; i++) {
    slots.push(`${String(i).padStart(2, '0')}:00`);
    slots.push(`${String(i).padStart(2, '0')}:30`);
  }
  return slots;
};

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const getStoredServices = () => {
  try {
    // Prova a recuperare da multiple sources
    const stored = localStorage.getItem('services');
    const backup1 = localStorage.getItem('services_backup');
    const backup2 = localStorage.getItem('customServices');
    
    console.log('DEBUG - Tentativo recupero servizi (AppointmentFormLogic):', {
      stored: stored ? JSON.parse(stored) : null,
      backup1: backup1 ? JSON.parse(backup1) : null,
      backup2: backup2 ? JSON.parse(backup2) : null
    });
    
    let servicesToLoad = null;
    if (stored) {
      try {
        servicesToLoad = JSON.parse(stored);
      } catch (e) {
        console.error('Errore parsing servizi principali:', e);
      }
    }
    
    if (!servicesToLoad && backup1) {
      try {
        servicesToLoad = JSON.parse(backup1);
        console.log('Usando backup1 per form');
      } catch (e) {
        console.error('Errore parsing backup1:', e);
      }
    }
    
    if (!servicesToLoad && backup2) {
      try {
        servicesToLoad = JSON.parse(backup2);
        console.log('Usando backup2 per form');
      } catch (e) {
        console.error('Errore parsing backup2:', e);
      }
    }
    
    if (servicesToLoad) {
      console.log('Servizi caricati da backup per form:', servicesToLoad);
      
      // Validate structure
      if (servicesToLoad.Parrucchiere && servicesToLoad.Estetista && 
          Array.isArray(servicesToLoad.Parrucchiere.services) && 
          Array.isArray(servicesToLoad.Estetista.services)) {
        return servicesToLoad;
      }
    }
    
    console.log('Nessun servizio valido in localStorage, usando defaults espansi');
    const defaultServices = {
      Parrucchiere: {
        name: 'Parrucchiere',
        services: [
          'Piega', 
          'Colore', 
          'Taglio', 
          'Colpi di sole', 
          'Trattamento Capelli',
          'Permanente',
          'Stiratura',
          'Extension',
          'Balayage',
          'Shatush'
        ]
      },
      Estetista: {
        name: 'Estetista',
        services: [
          'Pulizia Viso', 
          'Manicure', 
          'Pedicure', 
          'Massaggio', 
          'Depilazione', 
          'Trattamento Corpo',
          'Ricostruzione Unghie',
          'Semipermanente',
          'Trattamento Viso',
          'Ceretta'
        ]
      }
    };
    
    // Salva i defaults espansi in localStorage per la prossima volta con backup
    const dataToSave = JSON.stringify(defaultServices);
    localStorage.setItem('services', dataToSave);
    localStorage.setItem('services_backup', dataToSave);
    localStorage.setItem('customServices', dataToSave);
    return defaultServices;
  } catch (error) {
    console.error('Errore nel caricamento servizi:', error);
    return {
      Parrucchiere: {
        name: 'Parrucchiere',
        services: ['Piega', 'Colore', 'Taglio', 'Colpi di sole', 'Trattamento Capelli']
      },
      Estetista: {
        name: 'Estetista',
        services: ['Pulizia Viso', 'Manicure', 'Pedicure', 'Massaggio', 'Depilazione', 'Trattamento Corpo']
      }
    };
  }
};

interface UseAppointmentFormProps {
  isOpen: boolean;
  appointmentToEdit: Appointment | null;
  employeeId: number | null;
  time: string | null;
  date: Date;
  addAppointment?: (appointment: Appointment) => void;
  updateAppointment?: (appointment: Appointment) => void;
  onClose: () => void;
}

export const useAppointmentForm = ({
  isOpen,
  appointmentToEdit,
  employeeId,
  time,
  date,
  addAppointment,
  updateAppointment,
  onClose
}: UseAppointmentFormProps) => {
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
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Effect per gestire il cambio di modalità editing
  useEffect(() => {
    if (isOpen && appointmentToEdit) {
      console.log('DEBUG - Impostando modalità editing');
      setIsEditingMode(true);
    } else if (isOpen && !appointmentToEdit) {
      console.log('DEBUG - Impostando modalità creazione');
      setIsEditingMode(false);
    }
  }, [isOpen, appointmentToEdit]);

  // Effect per caricare i dati del form SOLO quando necessario
  useEffect(() => {
    if (isOpen && isEditingMode && appointmentToEdit) {
      console.log('DEBUG - Caricamento dati per modifica:', appointmentToEdit);
      
      const editFormData = {
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
      
      console.log('DEBUG - Impostazione dati modifica:', editFormData);
      setFormData(editFormData);
    } else if (isOpen && !isEditingMode) {
      console.log('DEBUG - Caricamento dati per nuovo appuntamento');
      
      const newFormData = {
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
      };
      
      console.log('DEBUG - Impostazione dati nuovo appuntamento:', newFormData);
      setFormData(newFormData);
    }
  }, [isOpen, isEditingMode, appointmentToEdit, employeeId, time]);

  // Effect per reset quando il dialog si chiude
  useEffect(() => {
    if (!isOpen) {
      console.log('DEBUG - Reset form alla chiusura');
      setIsEditingMode(false);
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

  // Debug: mostra quando formData cambia
  useEffect(() => {
    console.log('DEBUG - FormData CHANGED:', formData);
  }, [formData]);

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

  return {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit,
    handleGoogleCalendarSync
  };
};
