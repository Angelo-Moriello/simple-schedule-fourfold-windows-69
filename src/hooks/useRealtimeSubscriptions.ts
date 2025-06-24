
import { useEffect } from 'react';
import { Appointment, Employee } from '@/types/appointment';
import { supabase } from '@/integrations/supabase/client';

interface UseRealtimeSubscriptionsProps {
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  forcePageRefresh: () => void;
}

export const useRealtimeSubscriptions = ({ 
  setAppointments, 
  setEmployees, 
  forcePageRefresh 
}: UseRealtimeSubscriptionsProps) => {
  useEffect(() => {
    console.log('DEBUG - Configurazione realtime subscriptions...');
    
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('DEBUG - Realtime appointment change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newAppointment: Appointment = {
              id: payload.new.id,
              employeeId: payload.new.employee_id,
              date: payload.new.date,
              time: payload.new.time,
              title: payload.new.title || '',
              client: payload.new.client,
              duration: payload.new.duration,
              notes: payload.new.notes || '',
              email: payload.new.email || '',
              phone: payload.new.phone || '',
              color: payload.new.color,
              serviceType: payload.new.service_type
            };
            
            console.log('DEBUG - Nuovo appuntamento da realtime:', newAppointment);
            
            setAppointments(prev => {
              const exists = prev.some(apt => apt.id === newAppointment.id);
              console.log('DEBUG - Appuntamento già esistente?', exists);
              
              if (!exists) {
                const updated = [...prev, newAppointment];
                console.log('DEBUG - Appuntamenti dopo INSERT:', updated.length);
                setTimeout(forcePageRefresh, 500);
                return updated;
              }
              return prev;
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedAppointment: Appointment = {
              id: payload.new.id,
              employeeId: payload.new.employee_id,
              date: payload.new.date,
              time: payload.new.time,
              title: payload.new.title || '',
              client: payload.new.client,
              duration: payload.new.duration,
              notes: payload.new.notes || '',
              email: payload.new.email || '',
              phone: payload.new.phone || '',
              color: payload.new.color,
              serviceType: payload.new.service_type
            };
            
            console.log('DEBUG - Appuntamento aggiornato da realtime:', updatedAppointment);
            
            setAppointments(prev => {
              const updated = prev.map(apt =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
              );
              console.log('DEBUG - Appuntamenti dopo UPDATE:', updated.length);
              setTimeout(forcePageRefresh, 500);
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            console.log('DEBUG - Appuntamento eliminato da realtime:', payload.old.id);
            
            setAppointments(prev => {
              const updated = prev.filter(apt => apt.id !== payload.old.id);
              console.log('DEBUG - Appuntamenti dopo DELETE:', updated.length);
              setTimeout(forcePageRefresh, 500);
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('DEBUG - Stato subscription appuntamenti:', status);
      });

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
