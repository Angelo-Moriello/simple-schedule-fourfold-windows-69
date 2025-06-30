
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
      <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto bg-white/98 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <span className="text-3xl">
              {appointmentToEdit ? '✏️' : '➕'}
            </span>
            {appointmentToEdit ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </DialogTitle>
          <p className="text-center text-gray-600 text-sm mt-2">
            {appointmentToEdit 
              ? 'Aggiorna i dettagli del tuo appuntamento' 
              : 'Compila tutti i campi per creare un nuovo appuntamento'
            }
          </p>
        </DialogHeader>
        <div className="px-2">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormContainer;
