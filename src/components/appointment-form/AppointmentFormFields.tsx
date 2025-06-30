
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
    <div className="space-y-8">
      {/* Main Form Section */}
      <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-blue-600">📅</span>
          Dettagli Appuntamento
        </h3>
        
        <div className="space-y-6">
          {/* Employee and Time Row */}
          <EmployeeTimeFields
            formData={formData}
            setFormData={setFormData}
            employees={employees}
            timeSlots={timeSlots}
          />

          {/* Service and Title Row */}
          <ServiceTitleFields
            formData={formData}
            setFormData={setFormData}
            availableServices={availableServices}
            selectedEmployee={selectedEmployee}
          />

          {/* Duration and Notes Row */}
          <DurationNotesFields
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      </div>

      {/* Client Information Section */}
      <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-2xl p-6 border border-green-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-green-600">👤</span>
          Informazioni Cliente
        </h3>
        
        <div className="space-y-6">
          {/* Client and Color Row */}
          <ClientColorFields
            formData={formData}
            setFormData={setFormData}
            appointmentColors={appointmentColors}
          />

          {/* Contact Information Row */}
          <ContactFields
            formData={formData}
            setFormData={setFormData}
            appointmentToEdit={appointmentToEdit}
          />
        </div>
      </div>

      {/* Multi-Date Selector - Only show for new appointments */}
      {!appointmentToEdit && onSelectedDatesChange && (
        <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-2xl p-6 border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-orange-600">📆</span>
            Date Multiple
          </h3>
          <MultiDateSelector
            selectedDates={selectedDates}
            onDatesChange={onSelectedDatesChange}
            mainDate={mainDate}
          />
        </div>
      )}

      {/* Multiple Events Section - Only show for new appointments */}
      {!appointmentToEdit && onMultipleEventsChange && (
        <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-purple-600">📋</span>
            Eventi Multipli
          </h3>
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
        </div>
      )}
    </div>
  );
};

export default AppointmentFormFields;
