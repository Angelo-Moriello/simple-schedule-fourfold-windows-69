
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { Appointment, Employee } from '@/types/appointment';

interface FullCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  employees: Employee[];
  onDateSelect: (date: Date) => void;
}

type ViewType = 'day' | 'week' | 'month' | 'year';

const FullCalendar: React.FC<FullCalendarProps> = ({ 
  isOpen, 
  onClose, 
  appointments, 
  employees, 
  onDateSelect 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');

  const handlePrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => subDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
      case 'year':
        setCurrentDate(prev => subYears(prev, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
      case 'year':
        setCurrentDate(prev => addYears(prev, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    onClose();
  };

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(apt => apt.date === date);
  };

  const renderDayView = () => {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const dayAppointments = getAppointmentsForDate(dateKey);
    
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {employees.map(employee => {
            const employeeAppointments = dayAppointments.filter(apt => apt.employeeId === employee.id);
            return (
              <Card key={employee.id} className="h-64">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{employee.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {employeeAppointments.map(appointment => (
                    <div key={appointment.id} className={`${employee.color} p-2 rounded text-xs`}>
                      <div className="font-medium">{appointment.time}</div>
                      <div>{appointment.title}</div>
                      <div className="text-gray-600">{appointment.client}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayAppointments = getAppointmentsForDate(dateKey);
            const isToday = isSameDay(day, new Date());
            
            return (
              <Card 
                key={dateKey} 
                className={`h-32 cursor-pointer hover:bg-gray-50 ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs text-center">
                    {format(day, 'EEE d', { locale: it })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {dayAppointments.slice(0, 3).map(appointment => (
                    <div key={appointment.id} className="bg-blue-100 p-1 rounded text-xs truncate">
                      {appointment.time} - {appointment.title}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayAppointments.length - 3} altri</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="p-4">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(date) => date && handleDateClick(date)}
          className="w-full"
          locale={it}
          modifiers={{
            hasAppointments: (date) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              return getAppointmentsForDate(dateKey).length > 0;
            }
          }}
          modifiersStyles={{
            hasAppointments: { 
              backgroundColor: '#dbeafe', 
              color: '#1e40af',
              fontWeight: 'bold'
            }
          }}
        />
      </div>
    );
  };

  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(currentDate.getFullYear(), i, 1);
      return month;
    });

    return (
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {months.map(month => {
            const monthKey = format(month, 'yyyy-MM');
            const monthAppointments = appointments.filter(apt => apt.date.startsWith(monthKey));
            
            return (
              <Card 
                key={monthKey} 
                className="h-24 cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setCurrentDate(month);
                  setView('month');
                }}
              >
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-center">
                    {format(month, 'MMMM', { locale: it })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-xs text-gray-600">
                    {monthAppointments.length} appuntamenti
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const getTitle = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE d MMMM yyyy', { locale: it });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'd MMM', { locale: it })} - ${format(weekEnd, 'd MMM yyyy', { locale: it })}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: it });
      case 'year':
        return format(currentDate, 'yyyy', { locale: it });
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      case 'year':
        return renderYearView();
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Calendario Completo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Oggi
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <h2 className="text-lg sm:text-xl font-semibold text-center truncate max-w-full sm:max-w-[300px] px-2">
              {getTitle()}
            </h2>
            
            <Select value={view} onValueChange={(value: ViewType) => setView(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Giorno</SelectItem>
                <SelectItem value="week">Settimana</SelectItem>
                <SelectItem value="month">Mese</SelectItem>
                <SelectItem value="year">Anno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calendar Content */}
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullCalendar;
