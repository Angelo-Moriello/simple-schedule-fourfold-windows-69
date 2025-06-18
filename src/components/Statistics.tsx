
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowLeft, TrendingUp, Users, Calendar } from 'lucide-react';
import { Appointment, Employee } from '@/types/appointment';

interface StatisticsProps {
  appointments: Appointment[];
  employees: Employee[];
  onBack: () => void;
}

const Statistics = ({ appointments, employees, onBack }: StatisticsProps) => {
  const serviceTypes = ['Piega', 'Colore', 'Taglio', 'Colpi di sole', 'Trattamento', 'Altro'];
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  // Statistiche per tipo di servizio
  const serviceStats = useMemo(() => {
    const stats = serviceTypes.map(serviceType => {
      const count = appointments.filter(app => app.serviceType === serviceType).length;
      const percentage = appointments.length > 0 ? (count / appointments.length * 100).toFixed(1) : '0';
      return {
        name: serviceType,
        value: count,
        percentage: parseFloat(percentage)
      };
    }).filter(stat => stat.value > 0);

    return stats;
  }, [appointments]);

  // Statistiche per dipendente
  const employeeStats = useMemo(() => {
    return employees.map(employee => {
      const employeeAppointments = appointments.filter(app => app.employeeId === employee.id);
      const serviceBreakdown = serviceTypes.map(serviceType => ({
        serviceType,
        count: employeeAppointments.filter(app => app.serviceType === serviceType).length
      })).filter(item => item.count > 0);

      return {
        id: employee.id,
        name: employee.name,
        totalAppointments: employeeAppointments.length,
        serviceBreakdown
      };
    }).filter(emp => emp.totalAppointments > 0);
  }, [appointments, employees]);

  const chartConfig = {
    serviceType: {
      label: "Tipo di Servizio",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="h-10 w-10 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Statistiche Appuntamenti
          </h1>
        </div>

        {/* Riepilogo generale */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Appuntamenti</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clienti Unici</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(appointments.map(app => app.client)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servizi Diversi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serviceStats.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Grafico circolare dei servizi */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuzione Tipi di Servizio</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
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
            </CardContent>
          </Card>

          {/* Tabella dettagliata dei servizi */}
          <Card>
            <CardHeader>
              <CardTitle>Dettaglio Servizi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceStats.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{service.value}</div>
                      <div className="text-sm text-gray-600">{service.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiche per dipendente */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Statistiche per Dipendente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {employeeStats.map((employee) => (
                  <div key={employee.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{employee.name}</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {employee.totalAppointments} appuntamenti
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {employee.serviceBreakdown.map((service) => (
                        <div key={service.serviceType} className="bg-gray-50 p-3 rounded text-center">
                          <div className="font-medium text-sm">{service.serviceType}</div>
                          <div className="text-lg font-bold text-blue-600">{service.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
