
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Appointment, Employee } from '@/types/appointment';

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
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl sm:rounded-3xl">
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {appointmentToEdit ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormContainer;
