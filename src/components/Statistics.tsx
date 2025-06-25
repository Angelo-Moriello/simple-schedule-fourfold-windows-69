
import React, { useState } from 'react';
import { Appointment, Employee } from '@/types/appointment';
import { useStatisticsData } from '@/hooks/useStatisticsData';
import StatisticsHeader from './statistics/StatisticsHeader';
import StatisticsFilters from './StatisticsFilters';
import StatisticsCards from './statistics/StatisticsCards';
import ServiceDistributionChart from './statistics/ServiceDistributionChart';
import EmployeePerformanceChart from './statistics/EmployeePerformanceChart';
import WeeklyTrendChart from './statistics/WeeklyTrendChart';

interface StatisticsProps {
  appointments: Appointment[];
  employees: Employee[];
  onBack?: () => void;
}

const Statistics: React.FC<StatisticsProps> = ({ appointments, employees, onBack }) => {
  // Stati per i filtri
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [specialization, setSpecialization] = useState<'all' | 'Parrucchiere' | 'Estetista'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<'all' | number>('all');

  const {
    filteredAppointments,
    serviceTypeStats,
    employeeStats,
    timeStats,
    avgAppointmentsPerDay,
    mostActiveEmployee
  } = useStatisticsData(appointments, employees, dateRange, selectedEmployee, specialization);

  const handlePrint = () => {
    window.print();
  };

  const handleResetFilters = () => {
    setDateRange('week');
    setSpecialization('all');
    setSelectedEmployee('all');
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen print:bg-white">
      <StatisticsHeader onPrint={handlePrint} onBack={onBack} />

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

      <StatisticsCards
        totalAppointments={filteredAppointments.length}
        avgAppointmentsPerDay={avgAppointmentsPerDay}
        mostActiveEmployee={mostActiveEmployee}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <ServiceDistributionChart serviceTypeStats={serviceTypeStats} />
        <EmployeePerformanceChart employeeStats={employeeStats} />
      </div>

      {dateRange === 'week' && timeStats.length > 0 && (
        <WeeklyTrendChart timeStats={timeStats} />
      )}
    </div>
  );
};

export default Statistics;
