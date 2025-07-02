
import React from 'react';
import { Appointment, Employee } from '@/types/appointment';
import ClientAutocomplete from './fields/ClientAutocomplete';
import ServiceTitleFields from './fields/ServiceTitleFields';
import EmployeeTimeFields from './fields/EmployeeTimeFields';
import ClientColorFields from './fields/ClientColorFields';
import ContactFields from './fields/ContactFields';
import DurationNotesFields from './fields/DurationNotesFields';
import MultipleEventsManager from './MultipleEventsManager';

interface AppointmentFormFieldsProps {
  formData: Appointment;
  setFormData: (data: Appointment) => void;
  employees: Employee[];
  timeSlots: string[];
  appointmentColors: string[];
  availableServices: string[];
  selectedEmployee?: Employee;
  appointmentToEdit: Appointment | null;
  multipleEvents: Appointment[];
  onMultipleEventsChange: (events: Appointment[]) => void;
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
          value={formData.client}
          onChange={(value) => setFormData({ ...formData, client: value })}
          onClientIdChange={(clientId) => setFormData({ ...formData, clientId })}
          onEmailChange={(email) => setFormData({ ...formData, email })}
          onPhoneChange={(phone) => setFormData({ ...formData, phone })}
        />
      </div>

      {/* Service and Title - Stack on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <ServiceTitleFields
          serviceType={formData.serviceType}
          title={formData.title}
          availableServices={availableServices}
          selectedEmployee={selectedEmployee}
          onServiceTypeChange={(serviceType) => setFormData({ ...formData, serviceType })}
          onTitleChange={(title) => setFormData({ ...formData, title })}
        />
      </div>

      {/* Employee and Time - Stack on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <EmployeeTimeFields
          employeeId={formData.employeeId}
          time={formData.time}
          employees={employees}
          timeSlots={timeSlots}
          onEmployeeIdChange={(employeeId) => setFormData({ ...formData, employeeId })}
          onTimeChange={(time) => setFormData({ ...formData, time })}
        />
      </div>

      {/* Color Selection - Full width */}
      <div className="w-full">
        <ClientColorFields
          color={formData.color}
          colors={appointmentColors}
          onColorChange={(color) => setFormData({ ...formData, color })}
        />
      </div>

      {/* Contact Fields - Stack on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <ContactFields
          email={formData.email}
          phone={formData.phone}
          onEmailChange={(email) => setFormData({ ...formData, email })}
          onPhoneChange={(phone) => setFormData({ ...formData, phone })}
        />
      </div>

      {/* Duration and Notes - Stack on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <DurationNotesFields
          duration={formData.duration}
          notes={formData.notes}
          onDurationChange={(duration) => setFormData({ ...formData, duration })}
          onNotesChange={(notes) => setFormData({ ...formData, notes })}
        />
      </div>

      {/* Multiple Events Manager - Full width */}
      <div className="w-full">
        <MultipleEventsManager
          mainDate={mainDate}
          mainAppointment={formData}
          multipleEvents={multipleEvents}
          onMultipleEventsChange={onMultipleEventsChange}
          selectedDates={selectedDates}
          onSelectedDatesChange={onSelectedDatesChange}
          employees={employees}
          appointmentToEdit={appointmentToEdit}
        />
      </div>
    </div>
  );
};

export default AppointmentFormFields;
