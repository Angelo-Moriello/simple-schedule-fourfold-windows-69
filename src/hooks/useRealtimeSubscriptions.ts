
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

// Mobile detection helper
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Network status helper
const isOnline = () => {
  return navigator.onLine;
};

export const useRealtimeSubscriptions = ({ 
  setAppointments, 
  setEmployees, 
  forcePageRefresh 
}: UseRealtimeSubscriptionsProps) => {
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const isReconnectingRef = useRef(false);
  const lastSyncRef = useRef<number>(Date.now());

  // Enhanced sync function for mobile
  const performFullSync = async () => {
    try {
      console.log('DEBUG - Eseguendo sincronizzazione completa...');
      
      // Force reload appointments and employees from server
      const [appointmentsResponse, employeesResponse] = await Promise.all([
        supabase.from('appointments').select('*').order('date', { ascending: false }),
        supabase.from('employees').select('*').order('id')
      ]);

      if (appointmentsResponse.data) {
        const appointments = await Promise.all(appointmentsResponse.data.map(async (app) => {
          let clientName = app.client;
          let clientEmail = app.email || '';
          let clientPhone = app.phone || '';
          
          if ((!clientName || clientName.trim() === '') && app.client_id) {
            const clientInfo = await getClientInfo(app.client_id);
            if (clientInfo) {
              clientName = clientInfo.name;
              clientEmail = clientInfo.email || app.email || '';
              clientPhone = clientInfo.phone || app.phone || '';
            }
          }
          
          return {
            id: app.id,
            employeeId: app.employee_id,
            date: app.date,
            time: app.time,
            title: app.title || '',
            client: clientName || '',
            duration: app.duration,
            notes: app.notes || '',
            email: clientEmail,
            phone: clientPhone,
            color: app.color,
            serviceType: app.service_type,
            clientId: app.client_id
          };
        }));
        
        setAppointments(appointments);
        console.log('DEBUG - Appuntamenti sincronizzati:', appointments.length);
      }

      if (employeesResponse.data) {
        const employees = employeesResponse.data.map(emp => ({
          id: emp.id,
          name: emp.name,
          color: emp.color,
          specialization: emp.specialization as 'Parrucchiere' | 'Estetista',
          vacations: emp.vacations || []
        }));
        
        setEmployees(employees);
        console.log('DEBUG - Dipendenti sincronizzati:', employees.length);
      }

      lastSyncRef.current = Date.now();
    } catch (error) {
      console.error('Errore durante sincronizzazione completa:', error);
    }
  };

  // Enhanced reconnection logic for mobile
  const handleReconnection = async () => {
    if (isReconnectingRef.current) return;
    
    isReconnectingRef.current = true;
    console.log('DEBUG - Tentativo di riconnessione...');
    
    try {
      // Wait for network to be available
      if (!isOnline()) {
        console.log('DEBUG - Rete non disponibile, attendo...');
        await new Promise(resolve => {
          const checkNetwork = () => {
            if (isOnline()) {
              resolve(true);
            } else {
              setTimeout(checkNetwork, 1000);
            }
          };
          checkNetwork();
        });
      }

      // Perform full sync
      await performFullSync();
      
      // Force refresh on mobile for better reliability
      if (isMobile()) {
        setTimeout(() => {
          forcePageRefresh();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Errore durante riconnessione:', error);
    } finally {
      isReconnectingRef.current = false;
    }
  };

  useEffect(() => {
    console.log('DEBUG - Configurazione realtime subscriptions con supporto mobile migliorato...');
    
    // Enhanced appointment subscription with better error handling
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
                  const updated = [...prev, newAppointment];
                  
                  // On mobile, be more aggressive with refresh
                  if (isMobile()) {
                    setTimeout(forcePageRefresh, 500);
                  }
                  
                  return updated;
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
              
              setAppointments(prev => {
                const updated = prev.map(apt =>
                  apt.id === updatedAppointment.id ? updatedAppointment : apt
                );
                
                if (isMobile()) {
                  setTimeout(forcePageRefresh, 500);
                }
                
                return updated;
              });
              
            } else if (payload.eventType === 'DELETE') {
              setAppointments(prev => {
                const updated = prev.filter(apt => apt.id !== payload.old.id);
                
                if (isMobile()) {
                  setTimeout(forcePageRefresh, 500);
                }
                
                return updated;
              });
            }
          } catch (error) {
            console.error('Errore nel processare cambiamento realtime appuntamento:', error);
            // Fallback to full sync on error
            handleReconnection();
          }
        }
      )
      .subscribe((status) => {
        console.log('DEBUG - Stato subscription appuntamenti:', status);
        
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.log('DEBUG - Errore o timeout nella subscription, tentando riconnessione...');
          handleReconnection();
        }
      });

    // Enhanced employee subscription
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

    // Network status monitoring for mobile
    const handleOnline = () => {
      console.log('DEBUG - Rete disponibile, sincronizzando...');
      handleReconnection();
    };

    const handleOffline = () => {
      console.log('DEBUG - Rete non disponibile');
    };

    // Visibility change handling for mobile apps
    const handleVisibilityChange = () => {
      if (!document.hidden && isMobile()) {
        console.log('DEBUG - App tornata in primo piano, verificando sincronizzazione...');
        const timeSinceLastSync = Date.now() - lastSyncRef.current;
        
        // If more than 30 seconds since last sync, perform full sync
        if (timeSinceLastSync > 30000) {
          handleReconnection();
        }
      }
    };

    // Add event listeners for mobile reliability
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic sync check for mobile (every 2 minutes)
    const syncInterval = setInterval(() => {
      if (isMobile() && isOnline()) {
        const timeSinceLastSync = Date.now() - lastSyncRef.current;
        if (timeSinceLastSync > 120000) { // 2 minutes
          console.log('DEBUG - Sincronizzazione periodica mobile...');
          performFullSync();
        }
      }
    }, 60000); // Check every minute

    return () => {
      console.log('Pulizia subscriptions...');
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(employeesChannel);
      
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      clearInterval(syncInterval);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [setAppointments, setEmployees, forcePageRefresh]);
};
