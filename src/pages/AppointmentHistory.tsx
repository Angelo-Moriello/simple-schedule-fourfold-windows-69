
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Calendar, User, Briefcase, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Appointment, Employee } from '@/types/appointment';

const AppointmentHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Carica i dati dal localStorage
  const appointments: Appointment[] = JSON.parse(localStorage.getItem('appointments') || '[]');
  const employees: Employee[] = JSON.parse(localStorage.getItem('employees') || '[]');

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
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca per nome cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-200 focus:border-blue-500"
            />
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
