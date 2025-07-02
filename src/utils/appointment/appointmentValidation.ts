
import { toast } from 'sonner';

interface MultipleEvent {
  id: string;
  employeeId: string;
  time: string;
  serviceType: string;
  title: string;
  duration: string;
  notes: string;
}

export const validateAppointmentForm = (formData: any, multipleEvents: MultipleEvent[]) => {
  if (!formData.client.trim()) {
    toast.error('Il nome del cliente è obbligatorio');
    return false;
  }

  if (!formData.serviceType.trim()) {
    toast.error('Il tipo di servizio è obbligatorio');
    return false;
  }

  // Validate multiple events
  for (const event of multipleEvents) {
    if (!event.serviceType.trim()) {
      toast.error('Tutti gli eventi aggiuntivi devono avere un tipo di servizio');
      return false;
    }
    if (!event.time.trim()) {
      toast.error('Tutti gli eventi aggiuntivi devono avere un orario');
      return false;
    }
  }

  return true;
};
