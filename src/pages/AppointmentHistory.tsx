
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User, Briefcase, ArrowLeft, BarChart3, Calendar, Clock, Mail, Phone, CalendarDays, Scissors } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Appointment, Employee } from '@/types/appointment';
import { loadAppointmentsFromSupabase, loadEmployeesFromSupabase } from '@/utils/supabaseStorage';
import Statistics from '@/components/Statistics';
import SimpleHeader from '@/components/SimpleHeader';
import { toast } from 'sonner';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

const AppointmentHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Carica i dati da Supabase
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

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

  // Ottieni tutti i nomi clienti unici per l'omnibox con controlli di sicurezza migliorati
  const uniqueClients = useMemo(() => {
    try {
      // Assicuriamoci che appointments sia sempre un array valido
      if (!Array.isArray(appointments) || appointments.length === 0) {
        console.log('DEBUG - appointments non è un array valido o è vuoto:', appointments);
        return [];
      }
      
      // Filtriamo solo appuntamenti validi con client definiti
      const validAppointments = appointments.filter(app => 
        app && 
        typeof app === 'object' && 
        app.client && 
        typeof app.client === 'string' && 
        app.client.trim().length > 0
      );
      
      console.log('DEBUG - Appuntamenti validi filtrati:', validAppointments.length);
      
      if (validAppointments.length === 0) {
        return [];
      }
      
      // Creiamo un Set per ottenere nomi unici
      const clientsSet = new Set();
      validAppointments.forEach(app => {
        if (app.client) {
          clientsSet.add(app.client.trim());
        }
      });
      
      // Convertiamo in array e filtriamo per il termine di ricerca
      const allUniqueClients = Array.from(clientsSet) as string[];
      
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

  // Enhanced filtering with date filter con controlli di sicurezza
  const filteredAppointments = useMemo(() => {
    try {
      if (!Array.isArray(appointments) || appointments.length === 0) {
        return [];
      }

      let dateFilteredAppointments = [...appointments];

      // Apply date filter
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

      // Apply search filter
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

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr || typeof dateStr !== 'string') return 'Data non valida';
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: it });
    } catch (error) {
      console.error('Errore nel formatting della data:', dateStr, error);
      return dateStr || 'Data non valida';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento storico da Supabase...</p>
        </div>
      </div>
    );
  }

  if (showStatistics) {
    return <Statistics appointments={appointments} employees={employees} onBack={() => setShowStatistics(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <SimpleHeader 
          title="Storico Appuntamenti"
          subtitle={`${filteredAppointments.length} appuntamenti trovati`}
        >
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="h-10 w-10 rounded-full shrink-0"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button
            onClick={() => setShowStatistics(true)}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 h-10 sm:h-12 px-4 sm:px-6"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistiche
          </Button>
        </SimpleHeader>

        {/* Enhanced filters */}
        <div className="space-y-4 mb-6">
          {/* Date Filter */}
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="date-filter" className="text-sm font-medium mb-2 block">
                  Filtra per periodo
                </Label>
                <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
                  <SelectTrigger id="date-filter" className="h-10">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli appuntamenti</SelectItem>
                    <SelectItem value="today">Oggi</SelectItem>
                    <SelectItem value="week">Questa settimana</SelectItem>
                    <SelectItem value="month">Questo mese</SelectItem>
                    <SelectItem value="custom">Periodo personalizzato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateFilter === 'custom' && (
                <>
                  <div>
                    <Label htmlFor="start-date" className="text-sm font-medium mb-2 block">
                      Data inizio
                    </Label>
                    <input
                      id="start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="h-10 w-full px-3 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-sm font-medium mb-2 block">
                      Data fine
                    </Label>
                    <input
                      id="end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="h-10 w-full px-3 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Search Bar - con controlli di sicurezza migliorati */}
          <div className="relative w-full">
            {Array.isArray(uniqueClients) && uniqueClients.length >= 0 ? (
              <Command className="rounded-lg border shadow-md bg-white">
                <CommandInput
                  placeholder="Cerca per nome cliente..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  className="h-12 px-4 text-base"
                />
                {showSearch && uniqueClients.length > 0 && (
                  <CommandList className="max-h-48 border-t">
                    <CommandGroup>
                      {uniqueClients.map((client, index) => 
                        client && typeof client === 'string' ? (
                          <CommandItem
                            key={`client-${index}-${client}`}
                            onSelect={() => {
                              setSearchTerm(client);
                              setShowSearch(false);
                            }}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-50"
                          >
                            <User className="mr-3 h-4 w-4 shrink-0" />
                            <span className="text-base">{client}</span>
                          </CommandItem>
                        ) : null
                      )}
                    </CommandGroup>
                    {uniqueClients.length === 0 && (
                      <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                        Nessun cliente trovato
                      </CommandEmpty>
                    )}
                  </CommandList>
                )}
              </Command>
            ) : (
              <div className="rounded-lg border shadow-md bg-white p-4">
                <input
                  type="text"
                  placeholder="Cerca per nome cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 w-full px-3 text-base outline-none"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center">
              <p className="text-gray-500 text-sm sm:text-base">
                {searchTerm ? 'Nessun appuntamento trovato per la ricerca' : 'Nessun appuntamento salvato'}
              </p>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{appointment.client || 'Cliente sconosciuto'}</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {getEmployeeName(appointment.employeeId)} ({getEmployeeSpecialization(appointment.employeeId)})
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 text-sm sm:text-base">{formatDate(appointment.date)}</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <p className="text-xs sm:text-sm text-gray-600">{appointment.time} ({appointment.duration} min)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-purple-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{appointment.serviceType || 'Non specificato'}</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{appointment.title || 'Senza titolo'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {appointment.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-500 shrink-0" />
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{appointment.email}</p>
                        </div>
                      )}
                      {appointment.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-500 shrink-0" />
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{appointment.phone}</p>
                        </div>
                      )}
                      {appointment.notes && (
                        <p className="text-xs text-gray-500 truncate">Note: {appointment.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentHistory;
