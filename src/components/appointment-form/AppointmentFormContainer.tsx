
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Appointment } from '@/types/appointment';

interface AppointmentFormContainerProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentToEdit: Appointment | null;
  children: React.ReactNode;
}

const AppointmentFormContainer: React.FC<AppointmentFormContainerProps> = ({
  isOpen,
  onClose,
  appointmentToEdit,
  children
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {appointmentToEdit ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormContainer;
