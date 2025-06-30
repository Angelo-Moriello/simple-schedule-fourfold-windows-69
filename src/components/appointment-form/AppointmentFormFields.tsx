
import React from 'react';
import { Employee } from '@/types/appointment';
import EmployeeTimeFields from './fields/EmployeeTimeFields';
import ServiceTitleFields from './fields/ServiceTitleFields';
import ClientColorFields from './fields/ClientColorFields';
import ContactFields from './fields/ContactFields';
import DurationNotesFields from './fields/DurationNotesFields';

interface AppointmentFormFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  employees: Employee[];
  timeSlots: string[];
  appointmentColors: any[];
  availableServices: string[];
  selectedEmployee: Employee | undefined;
  appointmentToEdit: any;
}

const AppointmentFormFields: React.FC<AppointmentFormFieldsProps> = ({
  formData,
  setFormData,
  employees,
  timeSlots,
  appointmentColors,
  availableServices,
  selectedEmployee,
  appointmentToEdit
}) => {
  // Debug log per verificare i servizi disponibili
  console.log('DEBUG - Servizi disponibili nel form:', {
    selectedEmployee,
    specialization: selectedEmployee?.specialization,
    availableServices,
    availableServicesCount: availableServices.length
  });

  return (
    <>
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
    </>
  );
};

export default AppointmentFormFields;
