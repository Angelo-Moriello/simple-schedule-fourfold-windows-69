
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
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {employees.map(employee => {
            const employeeAppointments = dayAppointments.filter(apt => apt.employeeId === employee.id);
            return (
              <Card key={employee.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="text-lg font-semibold text-gray-800">{employee.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  {employeeAppointments.length > 0 ? (
                    employeeAppointments.map(appointment => (
                      <div key={appointment.id} className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg border-l-4 border-blue-500">
                        <div className="font-semibold text-gray-800">{appointment.time}</div>
                        <div className="text-gray-700 font-medium">{appointment.title}</div>
                        <div className="text-gray-600 text-sm">{appointment.client}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-8 italic">Nessun appuntamento</div>
                  )}
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
      <div className="p-6">
        <div className="grid grid-cols-7 gap-4">
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayAppointments = getAppointmentsForDate(dateKey);
            const isToday = isSameDay(day, new Date());
            
            return (
              <Card 
                key={dateKey} 
                className={`h-48 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 bg-white/80 backdrop-blur-sm ${isToday ? 'ring-2 ring-blue-500 bg-blue-50/80' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <CardTitle className="text-sm text-center font-semibold">
                    {format(day, 'EEE d', { locale: it })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-2">
                  {dayAppointments.slice(0, 4).map(appointment => (
                    <div key={appointment.id} className="bg-gradient-to-r from-blue-100 to-purple-100 p-1 rounded text-xs truncate border-l-2 border-blue-400">
                      <div className="font-medium">{appointment.time}</div>
                      <div className="text-gray-700">{appointment.title}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 4 && (
                    <div className="text-xs text-gray-600 font-medium bg-gray-100 p-1 rounded text-center">
                      +{dayAppointments.length - 4} altri
                    </div>
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
      <div className="p-3 sm:p-6 flex justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-6 shadow-xl border-0 w-full max-w-sm sm:max-w-md">
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
                fontWeight: 'bold',
                borderRadius: '8px'
              }
            }}
          />
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(currentDate.getFullYear(), i, 1);
      return month;
    });

    return (
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {months.map(month => {
            const monthKey = format(month, 'yyyy-MM');
            const monthAppointments = appointments.filter(apt => apt.date.startsWith(monthKey));
            
            return (
              <Card 
                key={monthKey} 
                className="h-32 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 bg-white/80 backdrop-blur-sm"
                onClick={() => {
                  setCurrentDate(month);
                  setView('month');
                }}
              >
                <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <CardTitle className="text-lg text-center font-semibold text-gray-800">
                    {format(month, 'MMMM', { locale: it })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{monthAppointments.length}</div>
                    <div className="text-xs text-gray-600">appuntamenti</div>
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
      <DialogContent className="max-w-[95vw] sm:max-w-7xl max-h-[95vh] w-[95vw] overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-2xl">
        <DialogHeader className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
            Calendario Completo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 order-2 lg:order-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevious}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToday}
                className="px-3 sm:px-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg text-xs sm:text-sm"
              >
                Oggi
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNext}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
            
            <div className="text-center order-1 lg:order-2 px-2">
              <h2 className="text-sm sm:text-lg lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent break-words">
                {getTitle()}
              </h2>
            </div>
            
            <div className="order-3 lg:order-3">
              <Select value={view} onValueChange={(value: ViewType) => setView(value)}>
                <SelectTrigger className="w-28 sm:w-36 rounded-full border-gray-200 bg-white/80 backdrop-blur-sm text-xs sm:text-sm">
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
          </div>

          {/* Calendar Content */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullCalendar;
