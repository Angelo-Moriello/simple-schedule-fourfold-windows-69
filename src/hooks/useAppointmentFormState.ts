import { useState, useEffect } from 'react';
import { Appointment } from '@/types/appointment';
import { appointmentColors } from '@/utils/appointmentFormUtils';
import { getStoredServices, refreshServices } from '@/utils/serviceStorage';

interface UseAppointmentFormStateProps {
  isOpen: boolean;
  appointmentToEdit: Appointment | null;
  employeeId: number | null;
  time: string | null;
}

export const useAppointmentFormState = ({
  isOpen,
  appointmentToEdit,
  employeeId,
  time
}: UseAppointmentFormStateProps) => {
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
  const [multipleEvents, setMultipleEvents] = useState<Appointment[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Listen for service updates
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('DEBUG - Storage changed, refreshing services');
      const newServices = refreshServices();
      setServiceCategories(newServices);
    };

    window.addEventListener('storage', handleStorageChange);
    
    const handleServiceUpdate = (event: any) => {
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

  return {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    serviceCategories,
    multipleEvents,
    setMultipleEvents,
    selectedDates,
    setSelectedDates
  };
};
