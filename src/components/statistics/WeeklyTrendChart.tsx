
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

interface TimeStats {
  day: string;
  appuntamenti: number;
}

interface WeeklyTrendChartProps {
  timeStats: TimeStats[];
}

const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ timeStats }) => {
  if (timeStats.length === 0) {
    return null;
  }

  return (
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
  );
};

export default WeeklyTrendChart;
