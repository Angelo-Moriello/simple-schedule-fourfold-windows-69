
import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Employee, Appointment } from '@/types/appointment';

interface AppointmentSchedulerHeaderProps {
  selectedDate: Date;
  employees: Employee[];
  appointments: Appointment[];
}

const AppointmentSchedulerHeader: React.FC<AppointmentSchedulerHeaderProps> = ({
  selectedDate,
  employees,
  appointments
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 mb-8 bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-6">
        <img 
          src="/lovable-uploads/e3330001-9a6b-4c26-a431-89d19870edfe.png" 
          alt="Da Capo a Piedi - Estetica & Parrucchieri" 
          className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-lg shadow-sm"
        />
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Calendario Appuntamenti
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 font-medium">
            {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: it })}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>{employees.length} dipendenti attivi</span>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>{appointments.length} appuntamenti totali</span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSchedulerHeader;
