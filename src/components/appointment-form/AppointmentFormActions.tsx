
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
  );
};

export default AppointmentFormActions;
