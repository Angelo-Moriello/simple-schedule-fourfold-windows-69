
import React from 'react';
import { Appointment, Employee } from '@/types/appointment';
import ClientAutocomplete from './fields/ClientAutocomplete';
import ServiceTitleFields from './fields/ServiceTitleFields';
import EmployeeTimeFields from './fields/EmployeeTimeFields';
import ClientColorFields from './fields/ClientColorFields';
import ContactFields from './fields/ContactFields';
import DurationNotesFields from './fields/DurationNotesFields';
import MultipleEventsManager from './MultipleEventsManager';
import MultiDateSelector from './fields/MultiDateSelector';

interface AppointmentFormFieldsProps {
  formData: Appointment;
  setFormData: (data: Appointment) => void;
  employees: Employee[];
  timeSlots: string[];
  appointmentColors: { label: string; value: string; }[];
  availableServices: string[];
  selectedEmployee?: Employee;
  appointmentToEdit: Appointment | null;
  multipleEvents: Appointment[];
  onMultipleEventsChange: (events: Appointment[]) => void;
  selectedDates: Date[];
  onSelectedDatesChange: (dates: Date[]) => void;
  mainDate: Date;
  serviceCategories: { [key: string]: { name: string; services: string[] } };
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
  mainDate,
  serviceCategories
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
          serviceCategories={serviceCategories}
          selectedEmployee={selectedEmployee}
          mainEmployeeId={formData.employeeId.toString()}
          mainTime={formData.time}
          mainDate={mainDate}
        />
      </div>

      {/* Multi Date Selector - Full width */}
      <div className="w-full">
        <MultiDateSelector
          selectedDates={selectedDates}
          onDatesChange={onSelectedDatesChange}
          mainDate={mainDate}
        />
      </div>
    </div>
  );
};

export default AppointmentFormFields;
