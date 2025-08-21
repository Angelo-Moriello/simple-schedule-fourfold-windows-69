
import { toast } from 'sonner';
import { validateAppointment } from './saving/appointmentValidator';
import { Appointment } from '@/types/appointment';

export const validateAppointmentForm = (formData: any, multipleEvents: Appointment[] = []) => {
  console.log('🔍 VALIDAZIONE DETTAGLIATA - Input ricevuti:', {
    formData: {
      client: formData.client,
      serviceType: formData.serviceType, 
      employeeId: formData.employeeId,
      time: formData.time,
      duration: formData.duration
    },
    multipleEventsCount: multipleEvents.length
  });

  // Validazione base del form
  if (!formData.client?.trim()) {
    console.log('❌ VALIDAZIONE FALLITA: Client mancante');
    toast.error('Il nome del cliente è obbligatorio');
    return false;
  }

  if (!formData.serviceType?.trim()) {
    console.log('❌ VALIDAZIONE FALLITA: ServiceType mancante');
    toast.error('Il tipo di servizio è obbligatorio');
    return false;
  }

  if (!formData.employeeId) {
    console.log('❌ VALIDAZIONE FALLITA: EmployeeId mancante');
    toast.error('Seleziona un dipendente');
    return false;
  }

  if (!formData.time) {
    console.log('❌ VALIDAZIONE FALLITA: Time mancante');
    toast.error('Seleziona un orario');
    return false;
  }

  if (!formData.duration || parseInt(formData.duration) <= 0) {
    console.log('❌ VALIDAZIONE FALLITA: Duration non valida');
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

    if (!event.duration || event.duration <= 0) {
      toast.error(`Evento ${i + 1}: durata non valida`);
      return false;
    }
  }

  console.log('✅ Validazione form completata con successo');
  return true;
};
