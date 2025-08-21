import { format } from 'date-fns';
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { useAppointmentFormState } from '@/hooks/useAppointmentFormState';
import { useAppointmentSubmission } from '@/hooks/useAppointmentSubmission';

interface UseAppointmentFormProps {
  isOpen: boolean;
  appointmentToEdit: Appointment | null;
  employeeId: number | null;
  time: string | null;
  date: Date;
  addAppointment?: (appointment: Appointment) => void;
  updateAppointment?: (appointment: Appointment) => void;
  onClose: () => void;
  forcePageRefresh?: () => void;
}

export const useAppointmentForm = ({
  isOpen,
  appointmentToEdit,
  employeeId,
  time,
  date,
  addAppointment,
  updateAppointment,
  onClose,
  forcePageRefresh,
  existingAppointments = []
}: UseAppointmentFormProps & { existingAppointments?: Appointment[] }) => {
  const {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    serviceCategories,
    multipleEvents,
    setMultipleEvents,
    selectedDates,
    setSelectedDates
  } = useAppointmentFormState({
    isOpen,
    appointmentToEdit,
    employeeId,
    time
  });

  const { submitAppointment } = useAppointmentSubmission({
    appointmentToEdit,
    date,
    addAppointment,
    updateAppointment,
    onClose,
    existingAppointments,
    forcePageRefresh
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitAppointment(formData, multipleEvents, selectedDates);
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
