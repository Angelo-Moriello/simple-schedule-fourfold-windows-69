
import React from 'react';
import { Employee } from '@/types/appointment';
import EmployeeTimeFields from './fields/EmployeeTimeFields';
import ServiceTitleFields from './fields/ServiceTitleFields';
import ClientColorFields from './fields/ClientColorFields';
import ContactFields from './fields/ContactFields';
import DurationNotesFields from './fields/DurationNotesFields';
import MultipleEventsManager from './MultipleEventsManager';
import MultiDateSelector from './fields/MultiDateSelector';
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
  selectedDates?: Date[];
  onSelectedDatesChange?: (dates: Date[]) => void;
  mainDate?: Date;
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
  onMultipleEventsChange,
  selectedDates = [],
  onSelectedDatesChange,
  mainDate = new Date()
}) => {
  console.log('DEBUG - Servizi disponibili nel form:', {
    selectedEmployee,
    specialization: selectedEmployee?.specialization,
    availableServices,
    availableServicesCount: availableServices.length
  });

  return (
    <div className="space-y-6">
      {/* Employee and Time Row */}
      <EmployeeTimeFields
        formData={formData}
        setFormData={setFormData}
        employees={employees}
        timeSlots={timeSlots}
      />

      <Separator className="my-4" />

      {/* Service and Title Row */}
      <ServiceTitleFields
        formData={formData}
        setFormData={setFormData}
        availableServices={availableServices}
        selectedEmployee={selectedEmployee}
      />

      <Separator className="my-4" />

      {/* Client and Color Row */}
      <ClientColorFields
        formData={formData}
        setFormData={setFormData}
        appointmentColors={appointmentColors}
      />

      <Separator className="my-4" />

      {/* Contact Information Row */}
      <ContactFields
        formData={formData}
        setFormData={setFormData}
        appointmentToEdit={appointmentToEdit}
      />

      <Separator className="my-4" />

      {/* Duration and Notes Row */}
      <DurationNotesFields
        formData={formData}
        setFormData={setFormData}
      />

      {/* Multi-Date Selector - Only show for new appointments */}
      {!appointmentToEdit && onSelectedDatesChange && (
        <>
          <Separator className="my-6" />
          <MultiDateSelector
            selectedDates={selectedDates}
            onDatesChange={onSelectedDatesChange}
            mainDate={mainDate}
          />
        </>
      )}

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
