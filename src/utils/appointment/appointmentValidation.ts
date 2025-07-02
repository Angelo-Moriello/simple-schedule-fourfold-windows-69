
import { toast } from 'sonner';
import { validateAppointment } from './saving/appointmentValidator';

interface MultipleEvent {
  id: string;
  employeeId: string;
  time: string;
  serviceType: string;
  title: string;
  duration: string;
  notes: string;
}

export const validateAppointmentForm = (formData: any, multipleEvents: MultipleEvent[] = []) => {
  // Validazione base del form
  if (!formData.client?.trim()) {
    toast.error('Il nome del cliente è obbligatorio');
    return false;
  }

  if (!formData.serviceType?.trim()) {
    toast.error('Il tipo di servizio è obbligatorio');
    return false;
  }

  if (!formData.employeeId) {
    toast.error('Seleziona un dipendente');
    return false;
  }

  if (!formData.time) {
    toast.error('Seleziona un orario');
    return false;
  }

  if (!formData.duration || parseInt(formData.duration) <= 0) {
    toast.error('Durata non valida');
    return false;
  }

  // Validazione eventi multipli
  for (let i = 0; i < multipleEvents.length; i++) {
    const event = multipleEvents[i];
    
    if (!event.serviceType?.trim()) {
      toast.error(`Evento ${i + 1}: tipo di servizio obbligatorio`);
      return false;
    }
    
    if (!event.time?.trim()) {
      toast.error(`Evento ${i + 1}: orario obbligatorio`);
      return false;
    }
    
    if (!event.employeeId) {
      toast.error(`Evento ${i + 1}: dipendente obbligatorio`);
      return false;
    }

    if (!event.duration || parseInt(event.duration) <= 0) {
      toast.error(`Evento ${i + 1}: durata non valida`);
      return false;
    }
  }

  console.log('✅ Validazione form completata con successo');
  return true;
};
