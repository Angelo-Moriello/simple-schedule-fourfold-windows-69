
import { useState, useEffect } from 'react';
import { Appointment } from '@/types/appointment';
import { toast } from 'sonner';
import { addClientToSupabase, loadClientsFromSupabase } from '@/utils/clientStorage';
import { format } from 'date-fns';
import { appointmentColors, generateUUID } from '@/utils/appointmentFormUtils';
import { getStoredServices, refreshServices } from '@/utils/serviceStorage';

interface MultipleEvent {
  id: string;
  employeeId: string;
  time: string;
  serviceType: string;
  title: string;
  duration: string;
  notes: string;
}

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
  const [serviceCategories, setServiceCategories] = useState(getStoredServices());
  const [multipleEvents, setMultipleEvents] = useState<MultipleEvent[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Listen for service updates
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('DEBUG - Storage changed, refreshing services');
      const newServices = refreshServices();
      setServiceCategories(newServices);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for service updates
    const handleServiceUpdate = (event) => {
      console.log('DEBUG - Service update event received:', event.detail);
      const newServices = refreshServices();
      setServiceCategories(newServices);
    };

    window.addEventListener('servicesUpdated', handleServiceUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('servicesUpdated', handleServiceUpdate);
    };
  }, []);

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
      setMultipleEvents([]);
      setSelectedDates([]);
    }
  }, [isOpen]);

  // Debug: mostra quando formData cambia
  useEffect(() => {
    console.log('DEBUG - FormData CHANGED:', formData);
  }, [formData]);

  const findExistingClient = async (clientName: string, email?: string, phone?: string) => {
    const existingClients = await loadClientsFromSupabase();
    console.log('DEBUG - Ricerca cliente esistente:', { clientName, email, phone });
    
    // First, try to find by exact name match (case insensitive, trimmed)
    let existingClient = existingClients.find(client => 
      client.name.toLowerCase().trim() === clientName.toLowerCase().trim()
    );
    
    if (existingClient) {
      console.log('DEBUG - Cliente trovato per name:', existingClient);
      return existingClient;
    }
    
    // If no name match and we have email or phone, try to find by those
    if (email?.trim()) {
      existingClient = existingClients.find(client => 
        client.email && client.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
      if (existingClient) {
        console.log('DEBUG - Cliente trovato per email:', existingClient);
        return existingClient;
      }
    }
    
    if (phone?.trim()) {
      existingClient = existingClients.find(client => 
        client.phone && client.phone.trim() === phone.trim()
      );
      if (existingClient) {
        console.log('DEBUG - Cliente trovato per telefono:', existingClient);
        return existingClient;
      }
    }
    
    console.log('DEBUG - Nessun cliente esistente trovato');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('DEBUG - Submit con formData:', formData);
    console.log('DEBUG - Submit con eventi multipli:', multipleEvents);
    console.log('DEBUG - Submit con date multiple:', selectedDates);
    
    if (!formData.client.trim()) {
      toast.error('Il nome del cliente è obbligatorio');
      return;
    }

    if (!formData.serviceType.trim()) {
      toast.error('Il tipo di servizio è obbligatorio');
      return;
    }

    // Validate multiple events
    for (const event of multipleEvents) {
      if (!event.serviceType.trim()) {
        toast.error('Tutti gli eventi aggiuntivi devono avere un tipo di servizio');
        return;
      }
      if (!event.time.trim()) {
        toast.error('Tutti gli eventi aggiuntivi devono avere un orario');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      
      let finalClientId = formData.clientId;
      
      // Handle client creation/finding logic
      if (!appointmentToEdit && !finalClientId) {
        console.log('DEBUG - Tentativo di trovare o creare cliente:', {
          name: formData.client,
          email: formData.email,
          phone: formData.phone
        });
        
        const existingClient = await findExistingClient(
          formData.client.trim(),
          formData.email?.trim(),
          formData.phone?.trim()
        );
        
        if (existingClient) {
          console.log('DEBUG - Cliente esistente trovato:', existingClient);
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

      // Create main appointment
      const mainAppointment: Appointment = {
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

      console.log('DEBUG - Salvataggio appuntamento principale:', mainAppointment);

      // Create additional appointments for multiple events
      const additionalAppointments: Appointment[] = multipleEvents.map(event => ({
        id: generateUUID(),
        employeeId: parseInt(event.employeeId),
        date: format(date, 'yyyy-MM-dd'),
        time: event.time,
        title: event.title.trim() || `${event.serviceType} - ${formData.client}`,
        client: formData.client.trim(),
        duration: parseInt(event.duration),
        notes: event.notes.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        color: formData.color,
        serviceType: event.serviceType,
        clientId: finalClientId
      }));

      // Create recurring appointments for selected dates
      const recurringAppointments: Appointment[] = selectedDates.flatMap(selectedDate => {
        const baseRecurringAppointment = {
          id: generateUUID(),
          employeeId: parseInt(formData.employeeId),
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: formData.time,
          title: formData.title.trim() || `${formData.serviceType} - ${formData.client}`,
          client: formData.client.trim(),
          duration: parseInt(formData.duration),
          notes: formData.notes.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          color: formData.color,
          serviceType: formData.serviceType,
          clientId: finalClientId
        };

        // Include main service on each selected date
        const appointments = [baseRecurringAppointment];

        // Include additional events on each selected date
        multipleEvents.forEach(event => {
          appointments.push({
            id: generateUUID(),
            employeeId: parseInt(event.employeeId),
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: event.time,
            title: event.title.trim() || `${event.serviceType} - ${formData.client}`,
            client: formData.client.trim(),
            duration: parseInt(event.duration),
            notes: event.notes.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            color: formData.color,
            serviceType: event.serviceType,
            clientId: finalClientId
          });
        });

        return appointments;
      });

      console.log('DEBUG - Salvataggio appuntamenti aggiuntivi:', additionalAppointments);
      console.log('DEBUG - Salvataggio appuntamenti ricorrenti:', recurringAppointments);

      if (appointmentToEdit && updateAppointment) {
        await updateAppointment(mainAppointment);
        toast.success('Appuntamento modificato con successo!');
      } else if (addAppointment) {
        // Save main appointment
        await addAppointment(mainAppointment);
        
        // Save additional appointments for same day
        for (const additionalAppointment of additionalAppointments) {
          await addAppointment(additionalAppointment);
        }

        // Save recurring appointments for selected dates
        for (const recurringAppointment of recurringAppointments) {
          await addAppointment(recurringAppointment);
        }
        
        const totalMainEvents = 1 + additionalAppointments.length;
        const totalRecurringEvents = recurringAppointments.length;
        const totalEvents = totalMainEvents + totalRecurringEvents;
        
        let successMessage = `${totalMainEvents} appuntament${totalMainEvents > 1 ? 'i creati' : 'o creato'} con successo!`;
        if (totalRecurringEvents > 0) {
          successMessage += ` Inoltre ${totalRecurringEvents} appuntament${totalRecurringEvents > 1 ? 'i ricorrenti creati' : 'o ricorrente creato'} per le date selezionate.`;
        }
        
        toast.success(successMessage);
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
    handleGoogleCalendarSync,
    serviceCategories,
    multipleEvents,
    setMultipleEvents,
    selectedDates,
    setSelectedDates
  };
};

export { appointmentColors, generateTimeSlots } from '@/utils/appointmentFormUtils';
