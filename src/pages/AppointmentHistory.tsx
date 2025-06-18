
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, Calendar, User, Briefcase, ArrowLeft, BarChart3 } from 'lucide-react';
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
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="h-10 w-10 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Storico Appuntamenti
          </h1>
          <Button
            onClick={() => setShowStatistics(true)}
            className="ml-auto bg-purple-600 hover:bg-purple-700"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistiche
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Command className="rounded-lg border shadow-md">
              <CommandInput
                placeholder="Cerca per nome cliente..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
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
            <Card className="p-8 text-center">
              <p className="text-gray-500">
                {searchTerm ? 'Nessun appuntamento trovato per la ricerca' : 'Nessun appuntamento salvato'}
              </p>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-800">{appointment.client}</p>
                        <p className="text-sm text-gray-600">{getEmployeeName(appointment.employeeId)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-800">{formatDate(appointment.date)}</p>
                        <p className="text-sm text-gray-600">{appointment.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-800">{appointment.serviceType || 'Non specificato'}</p>
                        <p className="text-sm text-gray-600">{appointment.title}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Durata: {appointment.duration} min</p>
                      {appointment.notes && (
                        <p className="text-xs text-gray-500 mt-1">Note: {appointment.notes}</p>
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
