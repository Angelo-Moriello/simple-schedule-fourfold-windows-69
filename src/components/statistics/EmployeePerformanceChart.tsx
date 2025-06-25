
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

interface EmployeeStats {
  name: string;
  appuntamenti: number;
  color: string;
}

interface EmployeePerformanceChartProps {
  employeeStats: EmployeeStats[];
}

const EmployeePerformanceChart: React.FC<EmployeePerformanceChartProps> = ({ employeeStats }) => {
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
  );
};

export default EmployeePerformanceChart;
