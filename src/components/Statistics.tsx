
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowLeft, TrendingUp, Users, Calendar } from 'lucide-react';
import { Appointment, Employee } from '@/types/appointment';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { it } from 'date-fns/locale';

interface StatisticsProps {
  appointments: Appointment[];
  employees: Employee[];
  onBack: () => void;
}

type TimeFilter = 'day' | 'week' | 'month' | 'year';

const Statistics = ({ appointments, employees, onBack }: StatisticsProps) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const serviceTypes = ['Piega', 'Colore', 'Taglio', 'Colpi di sole', 'Trattamento Capelli', 'Pulizia Viso', 'Manicure', 'Pedicure', 'Massaggio', 'Depilazione', 'Trattamento Corpo'];
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#87ceeb', '#dda0dd', '#98fb98', '#f0e68c', '#ffa07a'];

  // Filtra appuntamenti in base al periodo selezionato
  const filteredAppointments = useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    switch (timeFilter) {
      case 'day':
        startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
        break;
      case 'year':
        startDate = startOfYear(selectedDate);
        endDate = endOfYear(selectedDate);
        break;
      default:
        return appointments;
    }

    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isWithinInterval(appointmentDate, { start: startDate, end: endDate });
    });
  }, [appointments, timeFilter, selectedDate]);

  // Statistiche per tipo di servizio
  const serviceStats = useMemo(() => {
    const stats = serviceTypes.map(serviceType => {
      const count = filteredAppointments.filter(app => app.serviceType === serviceType).length;
      const percentage = filteredAppointments.length > 0 ? (count / filteredAppointments.length * 100).toFixed(1) : '0';
      return {
        name: serviceType,
        value: count,
        percentage: parseFloat(percentage)
      };
    }).filter(stat => stat.value > 0);

    return stats;
  }, [filteredAppointments]);

  // Statistiche per dipendente
  const employeeStats = useMemo(() => {
    return employees.map(employee => {
      const employeeAppointments = filteredAppointments.filter(app => app.employeeId === employee.id);
      const serviceBreakdown = serviceTypes.map(serviceType => ({
        serviceType,
        count: employeeAppointments.filter(app => app.serviceType === serviceType).length
      })).filter(item => item.count > 0);

      return {
        id: employee.id,
        name: employee.name,
        specialization: employee.specialization,
        totalAppointments: employeeAppointments.length,
        serviceBreakdown
      };
    }).filter(emp => emp.totalAppointments > 0);
  }, [filteredAppointments, employees]);

  const formatPeriodLabel = () => {
    switch (timeFilter) {
      case 'day':
        return format(selectedDate, 'dd MMMM yyyy', { locale: it });
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'dd MMM', { locale: it })} - ${format(weekEnd, 'dd MMM yyyy', { locale: it })}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy', { locale: it });
      case 'year':
        return format(selectedDate, 'yyyy', { locale: it });
      default:
        return '';
    }
  };

  const chartConfig = {
    serviceType: {
      label: "Tipo di Servizio",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="h-10 w-10 rounded-full shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Statistiche Appuntamenti
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Periodo: {formatPeriodLabel()}
            </p>
          </div>
        </div>

        {/* Filtri temporali */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 sm:mb-8">
          <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
            <SelectTrigger className="h-10 sm:h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Giorno</SelectItem>
              <SelectItem value="week">Settimana</SelectItem>
              <SelectItem value="month">Mese</SelectItem>
              <SelectItem value="year">Anno</SelectItem>
            </SelectContent>
          </Select>
          
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="h-10 sm:h-12 px-3 border border-gray-300 rounded-md text-sm sm:text-base col-span-2 sm:col-span-1"
          />
        </div>

        {/* Riepilogo generale */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Appuntamenti</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{filteredAppointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clienti Unici</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {new Set(filteredAppointments.map(app => app.client)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servizi Diversi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{serviceStats.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Grafico circolare dei servizi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Distribuzione Tipi di Servizio</CardTitle>
            </CardHeader>
            <CardContent>
              {serviceStats.length > 0 ? (
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] sm:max-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {serviceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  Nessun dato disponibile per il periodo selezionato
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabella dettagliata dei servizi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Dettaglio Servizi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {serviceStats.length > 0 ? serviceStats.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div 
                        className="w-4 h-4 rounded-full shrink-0" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="font-medium text-sm sm:text-base truncate">{service.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-base sm:text-lg">{service.value}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{service.percentage}%</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-500 py-8">
                    Nessun servizio nel periodo selezionato
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiche per dipendente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Statistiche per Dipendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              {employeeStats.length > 0 ? employeeStats.map((employee) => (
                <div key={employee.id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold truncate">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.specialization}</p>
                    </div>
                    <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded shrink-0 self-start sm:self-center">
                      {employee.totalAppointments} appuntamenti
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {employee.serviceBreakdown.map((service) => (
                      <div key={service.serviceType} className="bg-gray-50 p-3 rounded text-center">
                        <div className="font-medium text-xs sm:text-sm truncate">{service.serviceType}</div>
                        <div className="text-lg sm:text-xl font-bold text-blue-600">{service.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-8">
                  Nessun dipendente ha appuntamenti nel periodo selezionato
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
