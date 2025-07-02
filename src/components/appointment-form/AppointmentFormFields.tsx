
import React from 'react';
import { Appointment, Employee } from '@/types/appointment';
import ClientAutocomplete from './fields/ClientAutocomplete';
import ServiceTitleFields from './fields/ServiceTitleFields';
import EmployeeTimeFields from './fields/EmployeeTimeFields';
import ClientColorFields from './fields/ClientColorFields';
import ContactFields from './fields/ContactFields';
import DurationNotesFields from './fields/DurationNotesFields';
import MultipleEventsManager from './MultipleEventsManager';

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
  formData: Appointment;
  setFormData: (data: Appointment) => void;
  employees: Employee[];
  timeSlots: string[];
  appointmentColors: { label: string; value: string; }[];
  availableServices: string[];
  selectedEmployee?: Employee;
  appointmentToEdit: Appointment | null;
  multipleEvents: MultipleEvent[];
  onMultipleEventsChange: (events: MultipleEvent[]) => void;
  selectedDates: Date[];
  onSelectedDatesChange: (dates: Date[]) => void;
  mainDate: Date;
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
  multipleEvents,
  onMultipleEventsChange,
  selectedDates,
  onSelectedDatesChange,
  mainDate
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Client Selection - Full width on mobile */}
      <div className="w-full">
        <ClientAutocomplete
          formData={formData}
          setFormData={setFormData}
        />
      </div>

      {/* Service and Title - Stack on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <ServiceTitleFields
          formData={formData}
          setFormData={setFormData}
          availableServices={availableServices}
          selectedEmployee={selectedEmployee}
        />
      </div>

      {/* Employee and Time - Stack on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <EmployeeTimeFields
          formData={formData}
          setFormData={setFormData}
          employees={employees}
          timeSlots={timeSlots}
        />
      </div>

      {/* Color Selection - Full width */}
      <div className="w-full">
        <ClientColorFields
          formData={formData}
          setFormData={setFormData}
          appointmentColors={appointmentColors}
        />
      </div>

      {/* Contact Fields - Stack on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <ContactFields
          formData={formData}
          setFormData={setFormData}
          appointmentToEdit={appointmentToEdit}
        />
      </div>

      {/* Duration and Notes - Stack on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <DurationNotesFields
          formData={formData}
          setFormData={setFormData}
        />
      </div>

      {/* Multiple Events Manager - Full width */}
      <div className="w-full">
        <MultipleEventsManager
          events={multipleEvents}
          onEventsChange={onMultipleEventsChange}
          employees={employees}
          timeSlots={timeSlots}
          availableServices={availableServices}
          selectedEmployee={selectedEmployee}
          mainEmployeeId={formData.employeeId.toString()}
          mainTime={formData.time}
        />
      </div>
    </div>
  );
};

export default AppointmentFormFields;
