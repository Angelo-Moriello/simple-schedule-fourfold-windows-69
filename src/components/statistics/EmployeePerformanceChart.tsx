
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmployeeStats {
  name: string;
  appuntamenti: number;
  color: string;
}

interface EmployeePerformanceChartProps {
  employeeStats: EmployeeStats[];
}

const EmployeePerformanceChart: React.FC<EmployeePerformanceChartProps> = ({ employeeStats }) => {
  const isMobile = useIsMobile();

  // Genera colori diversi per ogni dipendente se non specificati
  const getEmployeeColor = (index: number, originalColor?: string) => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // emerald  
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // violet
      '#EC4899', // pink
      '#06B6D4', // cyan
      '#84CC16', // lime
    ];
    return originalColor || colors[index % colors.length];
  };

  if (employeeStats.length === 0) {
    return (
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
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold mb-2">Nessun dato disponibile</p>
              <p className="text-sm text-gray-400">
                Non ci sono appuntamenti per i dipendenti nel periodo selezionato
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
        <div className="space-y-6">
          {/* Grafico a barre orizzontali - nascosto in modalità mobile */}
          {!isMobile && (
            <div className="h-64 sm:h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeStats} layout="horizontal" margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                  <defs>
                    {employeeStats.map((_, index) => (
                      <linearGradient key={index} id={`employeeGradient${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={getEmployeeColor(index, employeeStats[index]?.color)} />
                        <stop offset="100%" stopColor={`${getEmployeeColor(index, employeeStats[index]?.color)}CC`} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#374151', fontSize: 12 }}
                    tickLine={{ stroke: '#9CA3AF' }}
                    axisLine={{ stroke: '#9CA3AF' }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: '#374151', fontSize: 12 }}
                    tickLine={{ stroke: '#9CA3AF' }}
                    axisLine={{ stroke: '#9CA3AF' }}
                    width={120}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(229, 231, 235, 0.8)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                    formatter={(value: any) => [`${value} appuntamenti`, 'Totale']}
                    labelFormatter={(name: any) => `Dipendente: ${name}`}
                  />
                  <Bar 
                    dataKey="appuntamenti" 
                    name="Appuntamenti"
                    radius={[0, 8, 8, 0]}
                  >
                    {employeeStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#employeeGradient${index})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Legenda dettagliata */}
          <div className="bg-gradient-to-r from-gray-50 to-green-50/30 rounded-xl p-4 border border-gray-200/50">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mr-2"></div>
              Dettaglio Performance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {employeeStats.map((stat, index) => (
                <div 
                  key={stat.name}
                  className="flex items-center justify-between bg-white/70 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ 
                        backgroundColor: getEmployeeColor(index, stat.color),
                        boxShadow: `0 2px 4px ${getEmployeeColor(index, stat.color)}40`
                      }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 leading-tight">
                        {stat.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">{stat.appuntamenti}</span> appuntamenti
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeePerformanceChart;
