
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { it } from 'date-fns/locale';
import { Appointment, Employee } from '@/types/appointment';
import { Calendar, TrendingUp, Users, Clock, ArrowLeft, Printer } from 'lucide-react';

interface StatisticsProps {
  appointments: Appointment[];
  employees: Employee[];
  onBack?: () => void;
}

// Colori più sobri e professionali
const SOFT_COLORS = [
  '#64748b', '#6b7280', '#71717a', '#737373', '#78716c', '#84cc16'
];

const Statistics: React.FC<StatisticsProps> = ({ appointments, employees, onBack }) => {
  // Statistiche per tipo di servizio
  const serviceTypeStats = useMemo(() => {
    const serviceTypes: { [key: string]: number } = {};
    appointments.forEach(appointment => {
      serviceTypes[appointment.serviceType] = (serviceTypes[appointment.serviceType] || 0) + 1;
    });

    return Object.entries(serviceTypes).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / appointments.length) * 100).toFixed(1)
    }));
  }, [appointments]);

  // Statistiche per dipendente
  const employeeStats = useMemo(() => {
    const employeeData: { [key: number]: number } = {};
    appointments.forEach(appointment => {
      employeeData[appointment.employeeId] = (employeeData[appointment.employeeId] || 0) + 1;
    });

    return employees.map(employee => ({
      name: employee.name,
      appuntamenti: employeeData[employee.id] || 0,
      color: employee.color
    })).filter(emp => emp.appuntamenti > 0);
  }, [appointments, employees]);

  // Statistiche settimanali
  const weeklyStats = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return format(appointmentDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      weeklyData.push({
        day: format(day, 'EEEE', { locale: it }).substring(0, 3),
        appuntamenti: dayAppointments.length
      });
    }
    
    return weeklyData;
  }, [appointments]);

  // Funzione di stampa
  const handlePrint = () => {
    window.print();
  };

  // Stats summary
  const avgAppointmentsPerDay = appointments.length / 7;
  const mostActiveEmployee = useMemo(() => {
    const employeeAppointments: { [key: number]: number } = {};
    appointments.forEach(app => {
      employeeAppointments[app.employeeId] = (employeeAppointments[app.employeeId] || 0) + 1;
    });
    
    const mostActive = Object.entries(employeeAppointments).reduce((max, [id, count]) => 
      count > max.count ? { id: parseInt(id), count } : max, 
      { id: 0, count: 0 }
    );
    
    return employees.find(emp => emp.id === mostActive.id);
  }, [appointments, employees]);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen print:bg-white">
      {/* Header più sobrio */}
      <div className="bg-white border border-gray-200 text-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-gray-600" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800">Statistiche</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">Analisi delle performance del salone</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 print:hidden"
            >
              <Printer className="h-4 w-4 mr-2" />
              Stampa
            </Button>
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 print:hidden"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cards statistiche principali - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Appuntamenti Totali</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{appointments.length}</p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Media Giornaliera</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{avgAppointmentsPerDay.toFixed(1)}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Performer</p>
                <p className="text-lg sm:text-xl font-bold text-gray-800">{mostActiveEmployee?.name || 'N/A'}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafici responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Grafico servizi */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center text-gray-800">
              <div className="bg-gray-200 rounded-full p-2 mr-3">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              Distribuzione Servizi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {serviceTypeStats.length > 0 ? (
              <div className="h-64 sm:h-80 lg:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceTypeStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius="80%"
                      innerRadius="30%"
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {serviceTypeStats.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={SOFT_COLORS[index % SOFT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Nessun dato disponibile</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grafico dipendenti */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center text-gray-800">
              <div className="bg-gray-200 rounded-full p-2 mr-3">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              Performance Dipendenti
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="h-64 sm:h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fill: '#666', fontSize: 12 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: '#666', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="appuntamenti" 
                    fill="#64748b"
                    name="Appuntamenti"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafico settimanale full width */}
      <Card className="shadow-sm border border-gray-200 bg-white">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center text-gray-800">
            <div className="bg-gray-200 rounded-full p-2 mr-3">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            Andamento Settimanale
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="h-64 sm:h-80 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#666', fontSize: 14, fontWeight: 'bold' }}
                />
                <YAxis 
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="appuntamenti" 
                  fill="#64748b"
                  name="Appuntamenti"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
