
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface ServiceStats {
  name: string;
  value: number;
  percentage: number;
}

interface ServiceDistributionChartProps {
  serviceTypeStats: ServiceStats[];
}

const ELEGANT_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'
];

const Custom3DLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percentage, name }: any) => {
  // Se ci sono più di 6 servizi, mostra solo le percentuali per evitare sovrapposizioni
  if (value < 2) return null; // Non mostrare label per valori troppo piccoli
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#374151" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-semibold"
      style={{
        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {name.length > 15 ? `${name.substring(0, 12)}...` : name}
    </text>
  );
};

const Custom3DPercentageLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
  if (percentage < 5) return null; // Non mostrare percentuali troppo piccole
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      className="text-xs font-bold"
      style={{
        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {`${percentage}%`}
    </text>
  );
};

const ServiceDistributionChart: React.FC<ServiceDistributionChartProps> = ({ serviceTypeStats }) => {
  console.log('ServiceDistributionChart received data:', serviceTypeStats);
  
  return (
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
          <div className="space-y-6">
            {/* Grafico 3D */}
            <div className="h-64 sm:h-80 lg:h-96 relative">
              {/* 3D Shadow Layer */}
              <div className="absolute inset-0 transform translate-x-2 translate-y-2 opacity-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceTypeStats}
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      innerRadius="30%"
                      fill="#000000"
                      dataKey="value"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Main 3D Chart */}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {ELEGANT_COLORS.map((color, index) => (
                      <React.Fragment key={index}>
                        <linearGradient id={`3dGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={color} />
                          <stop offset="50%" stopColor={color} />
                          <stop offset="100%" stopColor={`${color}99`} />
                        </linearGradient>
                        <filter id={`3dShadow${index}`}>
                          <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="rgba(0,0,0,0.3)" />
                        </filter>
                      </React.Fragment>
                    ))}
                  </defs>
                  <Pie
                    data={serviceTypeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={serviceTypeStats.length <= 8 ? Custom3DLabel : undefined}
                    outerRadius="75%"
                    innerRadius="35%"
                    fill="#8884d8"
                    dataKey="value"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth={4}
                  >
                    {serviceTypeStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#3dGradient${index % ELEGANT_COLORS.length})`}
                        filter={`url(#3dShadow${index % ELEGANT_COLORS.length})`}
                      />
                    ))}
                    <LabelList 
                      dataKey="percentage" 
                      content={Custom3DPercentageLabel}
                    />
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(229, 231, 235, 0.8)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
                    }}
                    formatter={(value: any, name: any) => [`${value} servizi (${serviceTypeStats.find(s => s.name === name)?.percentage}%)`, 'Quantità']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Statistiche testuali con legenda */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200/50">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mr-2"></div>
                Dettaglio Statistiche
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {serviceTypeStats.map((stat, index) => (
                  <div 
                    key={stat.name}
                    className="flex items-center justify-between bg-white/70 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ 
                          backgroundColor: ELEGANT_COLORS[index % ELEGANT_COLORS.length],
                          boxShadow: `0 2px 4px ${ELEGANT_COLORS[index % ELEGANT_COLORS.length]}40`
                        }}
                      ></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 leading-tight">
                          {stat.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <span className="font-semibold">{stat.value} app.</span>
                          <span className="text-gray-400">•</span>
                          <span className="font-semibold text-indigo-600">{stat.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold mb-2">Nessun dato disponibile</p>
              <p className="text-sm text-gray-400">
                Non ci sono appuntamenti che corrispondono ai filtri selezionati
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceDistributionChart;
