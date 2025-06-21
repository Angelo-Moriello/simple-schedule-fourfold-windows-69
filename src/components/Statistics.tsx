import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { it } from 'date-fns/locale';
import { Appointment, Employee } from '@/types/appointment';
import { Calendar, TrendingUp, Users, Clock, Euro, Star } from 'lucide-react';

interface StatisticsProps {
  appointments: Appointment[];
  employees: Employee[];
}

const RADIAN = Math.PI / 180;

// Custom 3D-style PieChart label
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, name
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="14"
      fontWeight="bold"
      filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.7))"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Enhanced 3D-style colors with gradients
const ENHANCED_COLORS = [
  'url(#gradient1)',
  'url(#gradient2)', 
  'url(#gradient3)',
  'url(#gradient4)',
  'url(#gradient5)',
  'url(#gradient6)'
];

const SOLID_COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
];

const Statistics: React.FC<StatisticsProps> = ({ appointments, employees }) => {
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
        appuntamenti: dayAppointments.length,
        ricavo: dayAppointments.length * 50 // Ricavo stimato
      });
    }
    
    return weeklyData;
  }, [appointments]);

  // Stats summary
  const totalRevenue = appointments.length * 50;
  const avgAppointmentsPerDay = appointments.length / 7;
  const mostActiveEmployee = useMemo(() => {
    const employeeStats: { [key: number]: number } = {};
    appointments.forEach(app => {
      employeeStats[app.employeeId] = (employeeStats[app.employeeId] || 0) + 1;
    });
    
    const mostActive = Object.entries(employeeStats).reduce((max, [id, count]) => 
      count > max.count ? { id: parseInt(id), count } : max, 
      { id: 0, count: 0 }
    );
    
    return employees.find(emp => emp.id === mostActive.id);
  }, [appointments, employees]);

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header migliorato */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-2xl">
        <div className="flex items-center space-x-4 mb-4">
          <TrendingUp className="h-10 w-10" />
          <h1 className="text-4xl font-bold">Statistiche Avanzate</h1>
        </div>
        <p className="text-xl opacity-90">Analisi completa delle performance del salone</p>
      </div>

      {/* Cards statistiche principali */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Appuntamenti Totali</p>
                <p className="text-3xl font-bold">{appointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Ricavo Stimato</p>
                <p className="text-3xl font-bold">€{totalRevenue}</p>
              </div>
              <Euro className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Media Giornaliera</p>
                <p className="text-3xl font-bold">{avgAppointmentsPerDay.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Top Performer</p>
                <p className="text-xl font-bold">{mostActiveEmployee?.name || 'N/A'}</p>
              </div>
              <Star className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grafico 3D dei servizi */}
        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              Distribuzione Servizi 3D
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {serviceTypeStats.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6d28d9" />
                      </linearGradient>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#0891b2" />
                      </linearGradient>
                      <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                      <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="3" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.3)"/>
                      </filter>
                    </defs>
                    <Pie
                      data={serviceTypeStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={120}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={3}
                      filter="url(#shadow)"
                    >
                      {serviceTypeStats.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={ENHANCED_COLORS[index % ENHANCED_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-xl">Nessun dato disponibile</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grafico settimanale */}
        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <BarChart className="h-6 w-6" />
              </div>
              Andamento Settimanale
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-96">
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
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="appuntamenti" 
                    fill="url(#barGradient)" 
                    name="Appuntamenti"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
