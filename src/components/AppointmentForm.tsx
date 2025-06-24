
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Appointment, Employee } from '@/types/appointment';
import AppointmentFormFields from './appointment-form/AppointmentFormFields';
import { useAppointmentForm, appointmentColors, generateTimeSlots, getStoredServices } from './appointment-form/AppointmentFormLogic';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  addAppointment?: (appointment: Appointment) => void;
  updateAppointment?: (appointment: Appointment) => void;
  employeeId: number | null;
  time: string | null;
  date: Date;
  appointmentToEdit: Appointment | null;
  employees: Employee[];
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  addAppointment,
  updateAppointment,
  employeeId,
  time,
  date,
  appointmentToEdit,
  employees
}) => {
  const {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit,
    handleGoogleCalendarSync
  } = useAppointmentForm({
    isOpen,
    appointmentToEdit,
    employeeId,
    time,
    date,
    addAppointment,
    updateAppointment,
    onClose
  });

  const timeSlots = generateTimeSlots();
  const serviceCategories = getStoredServices();

  const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employeeId));
  const availableServices = selectedEmployee && serviceCategories[selectedEmployee.specialization] 
    ? serviceCategories[selectedEmployee.specialization]
    : [];

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl sm:rounded-3xl">
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {appointmentToEdit ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <AppointmentFormFields
            formData={formData}
            setFormData={setFormData}
            employees={employees}
            timeSlots={timeSlots}
            appointmentColors={appointmentColors}
            availableServices={availableServices}
            selectedEmployee={selectedEmployee}
            appointmentToEdit={appointmentToEdit}
          />

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
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;
