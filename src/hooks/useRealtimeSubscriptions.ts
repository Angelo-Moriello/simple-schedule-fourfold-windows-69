
import { useEffect, useRef } from 'react';
import { Appointment, Employee } from '@/types/appointment';
import { supabase } from '@/integrations/supabase/client';

interface UseRealtimeSubscriptionsProps {
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  forcePageRefresh: () => void;
}

// Helper function to get client info by ID
const getClientInfo = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('name, email, phone')
      .eq('id', clientId)
      .maybeSingle();
    
    if (error) {
      console.error('Errore nel recupero info cliente:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Errore nel recupero info cliente:', error);
    return null;
  }
};

export const useRealtimeSubscriptions = ({ 
  setAppointments, 
  setEmployees, 
  forcePageRefresh 
}: UseRealtimeSubscriptionsProps) => {

  useEffect(() => {
    console.log('DEBUG - Configurazione realtime subscriptions...');
    
    // Appointment subscription
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        async (payload) => {
          console.log('DEBUG - Realtime appointment change:', payload);
          
          try {
            if (payload.eventType === 'INSERT') {
              let clientName = payload.new.client;
              let clientEmail = payload.new.email || '';
              let clientPhone = payload.new.phone || '';
              
              if ((!clientName || clientName.trim() === '') && payload.new.client_id) {
                console.log('DEBUG - Recupero info cliente per realtime INSERT:', payload.new.client_id);
                const clientInfo = await getClientInfo(payload.new.client_id);
                if (clientInfo) {
                  clientName = clientInfo.name;
                  clientEmail = clientInfo.email || payload.new.email || '';
                  clientPhone = clientInfo.phone || payload.new.phone || '';
                }
              }
              
              const newAppointment: Appointment = {
                id: payload.new.id,
                employeeId: payload.new.employee_id,
                date: payload.new.date,
                time: payload.new.time,
                title: payload.new.title || '',
                client: clientName || '',
                duration: payload.new.duration,
                notes: payload.new.notes || '',
                email: clientEmail,
                phone: clientPhone,
                color: payload.new.color,
                serviceType: payload.new.service_type,
                clientId: payload.new.client_id
              };
              
              setAppointments(prev => {
                const exists = prev.some(apt => apt.id === newAppointment.id);
                if (!exists) {
                  return [...prev, newAppointment];
                }
                return prev;
              });
              
            } else if (payload.eventType === 'UPDATE') {
              let clientName = payload.new.client;
              let clientEmail = payload.new.email || '';
              let clientPhone = payload.new.phone || '';
              
              if ((!clientName || clientName.trim() === '') && payload.new.client_id) {
                const clientInfo = await getClientInfo(payload.new.client_id);
                if (clientInfo) {
                  clientName = clientInfo.name;
                  clientEmail = clientInfo.email || payload.new.email || '';
                  clientPhone = clientInfo.phone || payload.new.phone || '';
                }
              }
              
              const updatedAppointment: Appointment = {
                id: payload.new.id,
                employeeId: payload.new.employee_id,
                date: payload.new.date,
                time: payload.new.time,
                title: payload.new.title || '',
                client: clientName || '',
                duration: payload.new.duration,
                notes: payload.new.notes || '',
                email: clientEmail,
                phone: clientPhone,
                color: payload.new.color,
                serviceType: payload.new.service_type,
                clientId: payload.new.client_id
              };
              
              setAppointments(prev => prev.map(apt =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
              ));
              
            } else if (payload.eventType === 'DELETE') {
              setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
            }
          } catch (error) {
            console.error('Errore nel processare cambiamento realtime appuntamento:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('DEBUG - Stato subscription appuntamenti:', status);
      });

    // Employee subscription
    const employeesChannel = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        (payload) => {
          console.log('DEBUG - Realtime employee change:', payload);
          
          try {
            if (payload.eventType === 'INSERT') {
              const newEmployee: Employee = {
                id: payload.new.id,
                name: payload.new.name,
                color: payload.new.color,
                specialization: payload.new.specialization as 'Parrucchiere' | 'Estetista',
                vacations: payload.new.vacations || []
              };
              
              setEmployees(prev => {
                const exists = prev.some(emp => emp.id === newEmployee.id);
                if (!exists) {
                  return [...prev, newEmployee];
                }
                return prev;
              });
              
            } else if (payload.eventType === 'UPDATE') {
              const updatedEmployee: Employee = {
                id: payload.new.id,
                name: payload.new.name,
                color: payload.new.color,
                specialization: payload.new.specialization as 'Parrucchiere' | 'Estetista',
                vacations: payload.new.vacations || []
              };
              
              setEmployees(prev => prev.map(emp =>
                emp.id === updatedEmployee.id ? updatedEmployee : emp
              ));
              
            } else if (payload.eventType === 'DELETE') {
              setEmployees(prev => prev.filter(emp => emp.id !== payload.old.id));
            }
          } catch (error) {
            console.error('Errore nel processare cambiamento realtime dipendente:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('DEBUG - Stato subscription dipendenti:', status);
      });

    return () => {
      console.log('Pulizia subscriptions...');
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(employeesChannel);
    };
  }, [setAppointments, setEmployees, forcePageRefresh]);
};
