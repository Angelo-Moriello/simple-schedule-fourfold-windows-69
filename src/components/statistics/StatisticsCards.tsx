
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Users } from 'lucide-react';
import { Employee } from '@/types/appointment';

interface StatisticsCardsProps {
  totalAppointments: number;
  avgAppointmentsPerDay: number;
  mostActiveEmployee?: Employee;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  totalAppointments,
  avgAppointmentsPerDay,
  mostActiveEmployee
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      <Card className="bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Appuntamenti Totali</p>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {totalAppointments}
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
  );
};

export default StatisticsCards;
