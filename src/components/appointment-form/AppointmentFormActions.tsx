
import React from 'react';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types/appointment';

interface AppointmentFormActionsProps {
  isSubmitting: boolean;
  appointmentToEdit: Appointment | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AppointmentFormActions: React.FC<AppointmentFormActionsProps> = ({
  isSubmitting,
  appointmentToEdit,
  onClose,
  onSubmit
}) => {
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 sm:pt-6 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleClose}
          disabled={isSubmitting}
          className="w-full sm:w-auto gap-2"
        >
          <span className="text-base">❌</span>
          <span>Annulla</span>
        </Button>
        <Button 
          type="submit"
          variant="success"
          size="lg"
          disabled={isSubmitting}
          className="w-full sm:w-auto gap-2"
        >
          <span className="text-base">{appointmentToEdit ? '💾' : '✅'}</span>
          <span>{isSubmitting ? 'Salvataggio...' : (appointmentToEdit ? 'Salva Modifiche' : 'Crea Appuntamento')}</span>
        </Button>
      </div>
    </form>
  );
};

export default AppointmentFormActions;
