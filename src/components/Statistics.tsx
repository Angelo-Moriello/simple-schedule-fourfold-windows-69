import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { Appointment, Employee } from '@/types/appointment';
import { Calendar, TrendingUp, Users, Clock, ArrowLeft, Printer, BarChart3 } from 'lucide-react';
import StatisticsFilters from './StatisticsFilters';

interface StatisticsProps {
  appointments: Appointment[];
  employees: Employee[];
  onBack?: () => void;
}

// Palette di colori elegante e professionale
const ELEGANT_COLORS = [
  '#8B9DC3', '#DDB6C6', '#AC8DAF', '#A8C8EC', '#C7A8A8', '#B8C5D1'
];

// Gradiente per le aree
const GRADIENT_COLORS = [
  { from: '#8B9DC3', to: '#E8EFFA' },
  { from: '#DDB6C6', to: '#F5E6EA' },
  { from: '#AC8DAF', to: '#EDE0EF' },
  { from: '#A8C8EC', to: '#E6F1FD' },
  { from: '#C7A8A8', to: '#F0E6E6' },
  { from: '#B8C5D1', to: '#E9EDF1' }
];

const Statistics: React.FC<StatisticsProps> = ({ appointments, employees, onBack }) => {
  // Stati per i filtri
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [specialization, setSpecialization] = useState<'all' | 'Parrucchiere' | 'Estetista'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<'all' | number>('all');

  // Funzione per ottenere l'intervallo di date
  const getDateInterval = (range: 'day' | 'week' | 'month' | 'year') => {
    const today = new Date();
    
    switch (range) {
      case 'day':
        return { start: startOfDay(today), end: endOfDay(today) };
      case 'week':
        return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case 'year':
        return { start: startOfYear(today), end: endOfYear(today) };
      default:
        return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
    }
  };

  // Appuntamenti filtrati
  const filteredAppointments = useMemo(() => {
    const interval = getDateInterval(dateRange);
    
    return appointments.filter(appointment => {
      // Filtro per data
      const appointmentDate = new Date(appointment.date);
      if (!isWithinInterval(appointmentDate, interval)) {
        return false;
      }

      // Filtro per dipendente
      if (selectedEmployee !== 'all' && appointment.employeeId !== selectedEmployee) {
        return false;
      }

      // Filtro per specializzazione
      if (specialization !== 'all') {
        const employee = employees.find(emp => emp.id === appointment.employeeId);
        if (!employee || employee.specialization !== specialization) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, dateRange, selectedEmployee, specialization, employees]);

  // Statistiche per tipo di servizio
  const serviceTypeStats = useMemo(() => {
    const serviceTypes: { [key: string]: number } = {};
    filteredAppointments.forEach(appointment => {
      serviceTypes[appointment.serviceType] = (serviceTypes[appointment.serviceType] || 0) + 1;
    });

    return Object.entries(serviceTypes).map(([name, value]) => ({
      name,
      value,
      percentage: filteredAppointments.length > 0 ? ((value / filteredAppointments.length) * 100).toFixed(1) : '0'
    }));
  }, [filteredAppointments]);

  // Statistiche per dipendente
  const employeeStats = useMemo(() => {
    const employeeData: { [key: number]: number } = {};
    filteredAppointments.forEach(appointment => {
      employeeData[appointment.employeeId] = (employeeData[appointment.employeeId] || 0) + 1;
    });

    return employees.map(employee => ({
      name: employee.name,
      appuntamenti: employeeData[employee.id] || 0,
      color: employee.color
    })).filter(emp => emp.appuntamenti > 0);
  }, [filteredAppointments, employees]);

  // Statistiche temporali con gradiente
  const timeStats = useMemo(() => {
    const interval = getDateInterval(dateRange);
    const timeData = [];
    
    if (dateRange === 'week') {
      for (let i = 0; i < 7; i++) {
        const day = new Date(interval.start);
        day.setDate(interval.start.getDate() + i);
        
        const dayAppointments = filteredAppointments.filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          return format(appointmentDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        });

        timeData.push({
          day: format(day, 'EEEE', { locale: it }).substring(0, 3),
          appuntamenti: dayAppointments.length
        });
      }
    }
    
    return timeData;
  }, [filteredAppointments, dateRange]);

  // Funzione di stampa
  const handlePrint = () => {
    window.print();
  };

  // Funzione reset filtri
  const handleResetFilters = () => {
    setDateRange('week');
    setSpecialization('all');
    setSelectedEmployee('all');
  };

  // Stats summary
  const avgAppointmentsPerDay = filteredAppointments.length / 7;
  const mostActiveEmployee = useMemo(() => {
    const employeeAppointments: { [key: number]: number } = {};
    filteredAppointments.forEach(app => {
      employeeAppointments[app.employeeId] = (employeeAppointments[app.employeeId] || 0) + 1;
    });
    
    const mostActive = Object.entries(employeeAppointments).reduce((max, [id, count]) => 
      count > max.count ? { id: parseInt(id), count } : max, 
      { id: 0, count: 0 }
    );
    
    return employees.find(emp => emp.id === mostActive.id);
  }, [filteredAppointments, employees]);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen print:bg-white">
      {/* Header con design migliorato */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-800 p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">Analisi delle performance del salone</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 print:hidden bg-white/50 backdrop-blur-sm border-gray-300/50 hover:bg-white/80"
            >
              <Printer className="h-4 w-4 mr-2" />
              Stampa
            </Button>
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 print:hidden bg-white/50 backdrop-blur-sm border-gray-300/50 hover:bg-white/80"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filtri */}
      <StatisticsFilters
        employees={employees}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        specialization={specialization}
        onSpecializationChange={setSpecialization}
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        onResetFilters={handleResetFilters}
      />

      {/* Cards statistiche principali con gradiente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Appuntamenti Totali</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {filteredAppointments.length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-md">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-green-50/30 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Media Giornaliera</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {avgAppointmentsPerDay.toFixed(1)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-md">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-purple-50/30 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Top Performer</p>
                <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {mostActiveEmployee?.name || 'N/A'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-3 rounded-xl shadow-md">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafici eleganti */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Grafico servizi con design elegante */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-200/50 rounded-t-lg">
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center text-gray-800">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-2 mr-3 shadow-md">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Distribuzione Servizi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {serviceTypeStats.length > 0 ? (
              <div className="h-64 sm:h-80 lg:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {ELEGANT_COLORS.map((color, index) => (
                        <linearGradient key={index} id={`gradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={color} />
                          <stop offset="100%" stopColor={`${color}CC`} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={serviceTypeStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius="75%"
                      innerRadius="35%"
                      fill="#8884d8"
                      dataKey="value"
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth={3}
                    >
                      {serviceTypeStats.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#gradient${index % ELEGANT_COLORS.length})`}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(229, 231, 235, 0.8)',
                        borderRadius: '12px',
                        fontSize: '14px',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
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

        {/* Grafico dipendenti con gradiente */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50/50 border-b border-gray-200/50 rounded-t-lg">
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center text-gray-800">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-2 mr-3 shadow-md">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Performance Dipendenti
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="h-64 sm:h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeStats} layout="horizontal">
                  <defs>
                    <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B9DC3" />
                      <stop offset="100%" stopColor="#A8C8EC" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(240, 240, 240, 0.8)" />
                  <XAxis type="number" tick={{ fill: '#666', fontSize: 12 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: '#666', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(229, 231, 235, 0.8)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="appuntamenti" 
                    fill="url(#barGradient)"
                    name="Appuntamenti"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafico temporale con area elegante */}
      {dateRange === 'week' && timeStats.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50/50 border-b border-gray-200/50 rounded-t-lg">
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center text-gray-800">
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-2 mr-3 shadow-md">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Andamento Settimanale
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="h-64 sm:h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeStats}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8B9DC3" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#8B9DC3" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(240, 240, 240, 0.8)" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: '#666', fontSize: 14, fontWeight: 'bold' }}
                  />
                  <YAxis 
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(229, 231, 235, 0.8)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="appuntamenti" 
                    stroke="#8B9DC3"
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                    name="Appuntamenti"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Statistics;
