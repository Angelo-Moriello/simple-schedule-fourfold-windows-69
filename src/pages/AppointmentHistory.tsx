import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User, Briefcase, ArrowLeft, BarChart3, Calendar, Clock, Mail, Phone, CalendarDays } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Appointment, Employee } from '@/types/appointment';
import { loadAppointments, loadEmployees } from '@/utils/dataStorage';
import Statistics from '@/components/Statistics';
import SimpleHeader from '@/components/SimpleHeader';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

const AppointmentHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Carica i dati dal localStorage con la nuova utility
  const appointments: Appointment[] = loadAppointments();
  const employees: Employee[] = loadEmployees();

  // Ottieni tutti i nomi clienti unici per l'omnibox
  const uniqueClients = useMemo(() => {
    const clients = new Set(appointments.map(app => app.client));
    return Array.from(clients).filter(client => client.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [appointments, searchTerm]);

  // Enhanced filtering with date filter
  const filteredAppointments = useMemo(() => {
    let dateFilteredAppointments = appointments;

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
        const appointmentDate = new Date(appointment.date);
        return isWithinInterval(appointmentDate, { start: startDate, end: endDate });
      });
    }

    // Apply search filter
    return dateFilteredAppointments
      .filter(appointment => 
        appointment.client.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
  }, [appointments, searchTerm, dateFilter, customStartDate, customEndDate]);

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Dipendente non trovato';
  };

  const getEmployeeSpecialization = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.specialization : '';
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: it });
    } catch (error) {
      return dateStr;
    }
  };

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

          {/* Search Bar */}
          <div className="relative w-full">
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
                    {uniqueClients.map((client) => (
                      <CommandItem
                        key={client}
                        onSelect={() => {
                          setSearchTerm(client);
                          setShowSearch(false);
                        }}
                        className="px-4 py-3 cursor-pointer hover:bg-gray-50"
                      >
                        <User className="mr-3 h-4 w-4 shrink-0" />
                        <span className="text-base">{client}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                    Nessun cliente trovato
                  </CommandEmpty>
                </CommandList>
              )}
            </Command>
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
                          <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{appointment.client}</p>
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
                        <Briefcase className="h-4 w-4 text-purple-600 shrink-0" />
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
