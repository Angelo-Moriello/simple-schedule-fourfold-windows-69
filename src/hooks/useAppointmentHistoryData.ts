
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Appointment, Employee } from '@/types/appointment';
import { loadAppointmentsFromSupabase, loadEmployeesFromSupabase } from '@/utils/supabaseStorage';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

export const useAppointmentHistoryData = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Caricamento dati storico da Supabase...');
        
        const [loadedAppointments, loadedEmployees] = await Promise.all([
          loadAppointmentsFromSupabase(),
          loadEmployeesFromSupabase()
        ]);
        
        console.log('Storico - Appuntamenti caricati:', loadedAppointments);
        console.log('Storico - Dipendenti caricati:', loadedEmployees);
        
        setAppointments(Array.isArray(loadedAppointments) ? loadedAppointments : []);
        setEmployees(Array.isArray(loadedEmployees) ? loadedEmployees : []);
        
      } catch (error) {
        console.error('Errore nel caricamento storico:', error);
        toast.error('Errore nel caricamento dello storico');
        setAppointments([]);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const uniqueClients = useMemo(() => {
    try {
      if (!Array.isArray(appointments) || appointments.length === 0) {
        return [];
      }
      
      const validAppointments = appointments.filter(app => 
        app && 
        typeof app === 'object' && 
        app.client && 
        typeof app.client === 'string' && 
        app.client.trim().length > 0
      );
      
      if (validAppointments.length === 0) {
        return [];
      }
      
      const clientsSet = new Set<string>();
      validAppointments.forEach(app => {
        if (app.client) {
          clientsSet.add(app.client.trim());
        }
      });
      
      const allUniqueClients = Array.from(clientsSet);
      
      if (!searchTerm || searchTerm.trim().length === 0) {
        return allUniqueClients;
      }
      
      const searchTermLower = searchTerm.toLowerCase().trim();
      return allUniqueClients.filter(client => 
        client && 
        typeof client === 'string' && 
        client.toLowerCase().includes(searchTermLower)
      );
      
    } catch (error) {
      console.error('Errore nella generazione dei clienti unici:', error);
      return [];
    }
  }, [appointments, searchTerm]);

  const filteredAppointments = useMemo(() => {
    try {
      if (!Array.isArray(appointments) || appointments.length === 0) {
        return [];
      }

      let dateFilteredAppointments = [...appointments];

      if (dateFilter !== 'all') {
        const today = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (dateFilter) {
          case 'today':
            startDate = new Date(today);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'week':
            startDate = startOfWeek(today, { weekStartsOn: 1 });
            endDate = endOfWeek(today, { weekStartsOn: 1 });
            break;
          case 'month':
            startDate = startOfMonth(today);
            endDate = endOfMonth(today);
            break;
          case 'custom':
            if (customStartDate && customEndDate) {
              startDate = new Date(customStartDate);
              endDate = new Date(customEndDate);
              endDate.setHours(23, 59, 59, 999);
            } else {
              startDate = new Date(0);
              endDate = new Date();
            }
            break;
          default:
            startDate = new Date(0);
            endDate = new Date();
        }

        dateFilteredAppointments = appointments.filter(appointment => {
          if (!appointment || !appointment.date) return false;
          try {
            const appointmentDate = new Date(appointment.date);
            return isWithinInterval(appointmentDate, { start: startDate, end: endDate });
          } catch (error) {
            console.error('Errore nel parsing della data:', appointment.date, error);
            return false;
          }
        });
      }

      const searchTermLower = searchTerm.toLowerCase().trim();
      return dateFilteredAppointments
        .filter(appointment => 
          appointment && 
          appointment.client && 
          typeof appointment.client === 'string' &&
          (searchTermLower === '' || appointment.client.toLowerCase().includes(searchTermLower))
        )
        .sort((a, b) => {
          try {
            if (!a.date || !a.time || !b.date || !b.time) return 0;
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateB.getTime() - dateA.getTime();
          } catch (error) {
            console.error('Errore nel sorting degli appuntamenti:', error);
            return 0;
          }
        });
    } catch (error) {
      console.error('Errore nel filtro degli appuntamenti:', error);
      return [];
    }
  }, [appointments, searchTerm, dateFilter, customStartDate, customEndDate]);

  const getEmployeeName = (employeeId: number) => {
    try {
      if (!Array.isArray(employees) || employees.length === 0) {
        return 'Dipendente non trovato';
      }
      const employee = employees.find(emp => emp && emp.id === employeeId);
      return employee ? employee.name : 'Dipendente non trovato';
    } catch (error) {
      console.error('Errore nel trovare il dipendente:', error);
      return 'Dipendente non trovato';
    }
  };

  const getEmployeeSpecialization = (employeeId: number) => {
    try {
      if (!Array.isArray(employees) || employees.length === 0) {
        return '';
      }
      const employee = employees.find(emp => emp && emp.id === employeeId);
      return employee ? employee.specialization : '';
    } catch (error) {
      console.error('Errore nel trovare la specializzazione:', error);
      return '';
    }
  };

  return {
    appointments,
    employees,
    isLoading,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    uniqueClients,
    filteredAppointments,
    getEmployeeName,
    getEmployeeSpecialization,
  };
};
