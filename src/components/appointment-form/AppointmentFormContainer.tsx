
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
      <DialogContent className="max-w-[95vw] w-full sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl lg:text-2xl">
            {appointmentToEdit ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1 sm:px-2 lg:px-4">
          <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-4">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormContainer;
