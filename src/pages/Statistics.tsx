
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Statistics from '@/components/Statistics';
import { Appointment, Employee } from '@/types/appointment';
import { loadEmployeesFromSupabase, loadAppointmentsFromSupabase } from '@/utils/supabaseStorage';

const StatisticsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading data for statistics page...');
        
        const [loadedEmployees, loadedAppointments] = await Promise.all([
          loadEmployeesFromSupabase(),
          loadAppointmentsFromSupabase()
        ]);
        
        console.log('Statistics page - employees loaded:', loadedEmployees);
        console.log('Statistics page - appointments loaded:', loadedAppointments);
        
        setEmployees(loadedEmployees);
        setAppointments(loadedAppointments);
      } catch (error) {
        console.error('Error loading data for statistics:', error);
        toast.error('Errore nel caricamento dei dati per le statistiche');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dati per le statistiche...</p>
        </div>
      </div>
    );
  }

  return (
    <Statistics 
      appointments={appointments}
      employees={employees}
      onBack={handleBack}
    />
  );
};

export default StatisticsPage;
