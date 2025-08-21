
import { useEffect, useRef } from 'react';
import { Appointment, Employee } from '@/types/appointment';
import { supabase } from '@/integrations/supabase/client';

interface UseRealtimeSubscriptionsProps {
  updateAppointmentSync?: (appointment: Appointment, operation: 'add' | 'update' | 'delete') => void;
  refreshAppointments?: () => Promise<void>;
  forcePageRefresh: () => void;
  // Backward compatibility
  setAppointments?: React.Dispatch<React.SetStateAction<Appointment[]>>;
  setEmployees?: React.Dispatch<React.SetStateAction<Employee[]>>;
}

// Helper function to get client info by ID
const getClientInfo = async (clientId: string | null) => {
  if (!clientId) return null;
  
  try {
    console.log('🔍 DEBUG - Richiesta info cliente per ID:', clientId);
    
    const { data, error } = await supabase
      .from('clients')
      .select('name, email, phone')
      .eq('id', clientId)
      .maybeSingle();
    
    if (error) {
      console.error('❌ DEBUG - Errore nel recupero info cliente per ID:', clientId, error);
      return null;
    }
    
    console.log('✅ DEBUG - Info cliente recuperate per ID:', clientId, '- Dati:', data);
    return data;
  } catch (error) {
    console.error('❌ DEBUG - Errore nel recupero info cliente per ID:', clientId, error);
    return null;
  }
};

export const useRealtimeSubscriptions = ({ 
  updateAppointmentSync,
  refreshAppointments,
  forcePageRefresh,
  setAppointments,
  setEmployees 
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
          console.log('🔔 DEBUG - Realtime appointment change:', payload);
          console.log('🔍 DEBUG - Payload details:', {
            eventType: payload.eventType,
            newData: payload.new,
            oldData: payload.old
          });
          
          try {
            if (payload.eventType === 'INSERT') {
              let clientName = payload.new.client;
              let clientEmail = payload.new.email || '';
              let clientPhone = payload.new.phone || '';
              
              console.log('➕ DEBUG - INSERT - Dati iniziali:', {
                clientName,
                clientEmail,
                clientPhone,
                clientId: payload.new.client_id
              });
              
              if ((!clientName || clientName.trim() === '') && payload.new.client_id) {
                console.log('🔄 DEBUG - Recupero info cliente per realtime INSERT:', payload.new.client_id);
                const clientInfo = await getClientInfo(payload.new.client_id);
                if (clientInfo) {
                  console.log('✅ DEBUG - Dati cliente recuperati:', clientInfo);
                  clientName = clientInfo.name || clientName;
                  clientEmail = clientInfo.email || payload.new.email || '';
                  clientPhone = clientInfo.phone || payload.new.phone || '';
                  console.log('🔄 DEBUG - Dati cliente aggiornati:', {
                    clientName,
                    clientEmail,
                    clientPhone
                  });
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
              
              console.log('📅 DEBUG - Nuovo appuntamento creato:', newAppointment);
              
              // Usa il nuovo sistema di sincronizzazione se disponibile
              if (updateAppointmentSync) {
                updateAppointmentSync(newAppointment, 'add');
              } else if (setAppointments) {
                // Fallback per compatibilità
                setAppointments(prev => {
                  const exists = prev.some(apt => apt.id === newAppointment.id);
                  if (!exists) {
                    return [...prev, newAppointment];
                  }
                  return prev;
                });
              }
              
            } else if (payload.eventType === 'UPDATE') {
              let clientName = payload.new.client;
              let clientEmail = payload.new.email || '';
              let clientPhone = payload.new.phone || '';
              
              console.log('🔄 DEBUG - UPDATE - Dati iniziali:', {
                clientName,
                clientEmail,
                clientPhone,
                clientId: payload.new.client_id
              });
              
              if ((!clientName || clientName.trim() === '') && payload.new.client_id) {
                console.log('🔄 DEBUG - Recupero info cliente per realtime UPDATE:', payload.new.client_id);
                const clientInfo = await getClientInfo(payload.new.client_id);
                if (clientInfo) {
                  console.log('✅ DEBUG - Dati cliente recuperati per UPDATE:', clientInfo);
                  clientName = clientInfo.name || clientName;
                  clientEmail = clientInfo.email || payload.new.email || '';
                  clientPhone = clientInfo.phone || payload.new.phone || '';
                  console.log('🔄 DEBUG - Dati cliente aggiornati per UPDATE:', {
                    clientName,
                    clientEmail,
                    clientPhone
                  });
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
              
              console.log('📝 DEBUG - Appuntamento aggiornato:', updatedAppointment);
              
              // Usa il nuovo sistema di sincronizzazione se disponibile
              if (updateAppointmentSync) {
                updateAppointmentSync(updatedAppointment, 'update');
              } else if (setAppointments) {
                // Fallback per compatibilità
                setAppointments(prev => prev.map(apt =>
                  apt.id === updatedAppointment.id ? updatedAppointment : apt
                ));
              }
              
            } else if (payload.eventType === 'DELETE') {
              console.log('🗑️ DEBUG - DELETE appuntamento:', payload.old.id);
              
              // Usa il nuovo sistema di sincronizzazione se disponibile
              if (updateAppointmentSync) {
                // Per il delete, crea un oggetto temporaneo con l'ID
                const deletedAppointment: Appointment = { id: payload.old.id } as Appointment;
                updateAppointmentSync(deletedAppointment, 'delete');
              } else if (setAppointments) {
                // Fallback per compatibilità
                setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
              }
            }
          } catch (error) {
            console.error('❌ DEBUG - Errore nel processare cambiamento realtime appuntamento:', error);
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
              
              // Gestione dipendenti rimane uguale (no sync per ora)
              if (setEmployees) {
                setEmployees(prev => {
                  const exists = prev.some(emp => emp.id === newEmployee.id);
                  if (!exists) {
                    return [...prev, newEmployee];
                  }
                  return prev;
                });
              }
              
            } else if (payload.eventType === 'UPDATE') {
              const updatedEmployee: Employee = {
                id: payload.new.id,
                name: payload.new.name,
                color: payload.new.color,
                specialization: payload.new.specialization as 'Parrucchiere' | 'Estetista',
                vacations: payload.new.vacations || []
              };
              
              if (setEmployees) {
                setEmployees(prev => prev.map(emp =>
                  emp.id === updatedEmployee.id ? updatedEmployee : emp
                ));
              }
              
            } else if (payload.eventType === 'DELETE') {
              if (setEmployees) {
                setEmployees(prev => prev.filter(emp => emp.id !== payload.old.id));
              }
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
  }, [updateAppointmentSync, refreshAppointments, setAppointments, setEmployees, forcePageRefresh]);
};
