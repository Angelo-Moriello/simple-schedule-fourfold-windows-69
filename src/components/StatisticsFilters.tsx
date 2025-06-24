
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Scissors, Filter } from 'lucide-react';
import { Employee } from '@/types/appointment';

interface StatisticsFiltersProps {
  employees: Employee[];
  dateRange: 'day' | 'week' | 'month' | 'year';
  onDateRangeChange: (range: 'day' | 'week' | 'month' | 'year') => void;
  specialization: 'all' | 'Parrucchiere' | 'Estetista';
  onSpecializationChange: (spec: 'all' | 'Parrucchiere' | 'Estetista') => void;
  selectedEmployee: 'all' | number;
  onEmployeeChange: (employeeId: 'all' | number) => void;
  onResetFilters: () => void;
}

const StatisticsFilters: React.FC<StatisticsFiltersProps> = ({
  employees,
  dateRange,
  onDateRangeChange,
  specialization,
  onSpecializationChange,
  selectedEmployee,
  onEmployeeChange,
  onResetFilters
}) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-200/50 pb-3 rounded-t-lg">
        <CardTitle className="text-lg font-bold flex items-center text-gray-800">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2 mr-3 shadow-md">
            <Filter className="h-4 w-4 text-white" />
          </div>
          Filtri Statistiche
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro periodo */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Calendar className="h-4 w-4 text-blue-600" />
              Periodo
            </label>
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="h-10 rounded-lg border-gray-200/60 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Oggi</SelectItem>
                <SelectItem value="week">Questa Settimana</SelectItem>
                <SelectItem value="month">Questo Mese</SelectItem>
                <SelectItem value="year">Quest'Anno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro specializzazione */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Scissors className="h-4 w-4 text-green-600" />
              Specializzazione
            </label>
            <Select value={specialization} onValueChange={onSpecializationChange}>
              <SelectTrigger className="h-10 rounded-lg border-gray-200/60 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="Parrucchiere">Parrucchiere</SelectItem>
                <SelectItem value="Estetista">Estetista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro dipendente */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users className="h-4 w-4 text-purple-600" />
              Dipendente
            </label>
            <Select 
              value={selectedEmployee.toString()} 
              onValueChange={(value) => onEmployeeChange(value === 'all' ? 'all' : parseInt(value))}
            >
              <SelectTrigger className="h-10 rounded-lg border-gray-200/60 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name} ({employee.specialization})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pulsante reset */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-transparent">Reset</label>
            <Button
              onClick={onResetFilters}
              variant="outline"
              className="w-full h-10 rounded-lg border-gray-300/60 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all"
            >
              Reset Filtri
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsFilters;
