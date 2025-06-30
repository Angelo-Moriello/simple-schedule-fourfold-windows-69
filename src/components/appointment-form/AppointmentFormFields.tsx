
import React from 'react';
import { Employee } from '@/types/appointment';
import EmployeeTimeFields from './fields/EmployeeTimeFields';
import ServiceTitleFields from './fields/ServiceTitleFields';
import ClientColorFields from './fields/ClientColorFields';
import ContactFields from './fields/ContactFields';
import DurationNotesFields from './fields/DurationNotesFields';
import MultipleEventsManager from './MultipleEventsManager';
import { Separator } from '@/components/ui/separator';

interface MultipleEvent {
  id: string;
  employeeId: string;
  time: string;
  serviceType: string;
  title: string;
  duration: string;
  notes: string;
}

interface AppointmentFormFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  employees: Employee[];
  timeSlots: string[];
  appointmentColors: any[];
  availableServices: string[];
  selectedEmployee: Employee | undefined;
  appointmentToEdit: any;
  multipleEvents?: MultipleEvent[];
  onMultipleEventsChange?: (events: MultipleEvent[]) => void;
}

const AppointmentFormFields: React.FC<AppointmentFormFieldsProps> = ({
  formData,
  setFormData,
  employees,
  timeSlots,
  appointmentColors,
  availableServices,
  selectedEmployee,
  appointmentToEdit,
  multipleEvents = [],
  onMultipleEventsChange
}) => {
  // Debug log per verificare i servizi disponibili
  console.log('DEBUG - Servizi disponibili nel form:', {
    selectedEmployee,
    specialization: selectedEmployee?.specialization,
    availableServices,
    availableServicesCount: availableServices.length
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <EmployeeTimeFields
            formData={formData}
            setFormData={setFormData}
            employees={employees}
            timeSlots={timeSlots}
          />

          <ServiceTitleFields
            formData={formData}
            setFormData={setFormData}
            availableServices={availableServices}
            selectedEmployee={selectedEmployee}
          />
        </div>

        <div className="space-y-4">
          <ClientColorFields
            formData={formData}
            setFormData={setFormData}
            appointmentColors={appointmentColors}
          />

          <ContactFields
            formData={formData}
            setFormData={setFormData}
            appointmentToEdit={appointmentToEdit}
          />

          <DurationNotesFields
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      </div>

      {/* Multiple Events Section - Only show for new appointments */}
      {!appointmentToEdit && onMultipleEventsChange && (
        <>
          <Separator className="my-6" />
          <MultipleEventsManager
            events={multipleEvents}
            onEventsChange={onMultipleEventsChange}
            employees={employees}
            timeSlots={timeSlots}
            availableServices={availableServices}
            selectedEmployee={selectedEmployee}
            mainEmployeeId={formData.employeeId}
            mainTime={formData.time}
          />
        </>
      )}
    </div>
  );
};

export default AppointmentFormFields;
