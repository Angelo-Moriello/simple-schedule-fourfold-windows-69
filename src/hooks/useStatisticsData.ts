
import { useMemo } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { Appointment, Employee } from '@/types/appointment';

export const useStatisticsData = (
  appointments: Appointment[],
  employees: Employee[],
  dateRange: 'day' | 'week' | 'month' | 'year',
  selectedEmployee: 'all' | number,
  specialization: 'all' | 'Parrucchiere' | 'Estetista'
) => {
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

  const filteredAppointments = useMemo(() => {
    const interval = getDateInterval(dateRange);
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      if (!isWithinInterval(appointmentDate, interval)) {
        return false;
      }

      if (selectedEmployee !== 'all' && appointment.employeeId !== selectedEmployee) {
        return false;
      }

      if (specialization !== 'all') {
        const employee = employees.find(emp => emp.id === appointment.employeeId);
        if (!employee || employee.specialization !== specialization) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, dateRange, selectedEmployee, specialization, employees]);

  const serviceTypeStats = useMemo(() => {
    const serviceTypes: { [key: string]: number } = {};
    filteredAppointments.forEach(appointment => {
      serviceTypes[appointment.serviceType] = (serviceTypes[appointment.serviceType] || 0) + 1;
    });

    return Object.entries(serviceTypes).map(([name, value]) => ({
      name,
      value,
      percentage: filteredAppointments.length > 0 ? parseFloat(((value / filteredAppointments.length) * 100).toFixed(1)) : 0
    }));
  }, [filteredAppointments]);

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

  return {
    filteredAppointments,
    serviceTypeStats,
    employeeStats,
    timeStats,
    avgAppointmentsPerDay,
    mostActiveEmployee
  };
};
