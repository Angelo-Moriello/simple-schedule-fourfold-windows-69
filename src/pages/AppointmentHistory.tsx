
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { User, Briefcase, ArrowLeft, BarChart3, Calendar, Clock, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Appointment, Employee } from '@/types/appointment';
import Statistics from '@/components/Statistics';

const AppointmentHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Carica i dati dal localStorage
  const appointments: Appointment[] = JSON.parse(localStorage.getItem('appointments') || '[]');
  const employees: Employee[] = JSON.parse(localStorage.getItem('employees') || '[]');

  // Ottieni tutti i nomi clienti unici per l'omnibox
  const uniqueClients = useMemo(() => {
    const clients = new Set(appointments.map(app => app.client));
    return Array.from(clients).filter(client => client.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [appointments, searchTerm]);

  // Filtra e ordina gli appuntamenti
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(appointment => 
        appointment.client.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
  }, [appointments, searchTerm]);

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="h-10 w-10 rounded-full shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Storico Appuntamenti
            </h1>
          </div>
          <Button
            onClick={() => setShowStatistics(true)}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 h-10 sm:h-12 px-4 sm:px-6"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistiche
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative w-full max-w-md">
            <Command className="rounded-lg border shadow-md">
              <CommandInput
                placeholder="Cerca per nome cliente..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                className="h-10 sm:h-12"
              />
              {showSearch && uniqueClients.length > 0 && (
                <CommandList className="max-h-48">
                  <CommandGroup>
                    {uniqueClients.map((client) => (
                      <CommandItem
                        key={client}
                        onSelect={() => {
                          setSearchTerm(client);
                          setShowSearch(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {client}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandEmpty>Nessun cliente trovato</CommandEmpty>
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
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{appointment.title}</p>
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
