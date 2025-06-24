
import { useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Appointment, Employee } from '@/types/appointment';

interface DailyStatsToastProps {
  appointments: Appointment[];
  employees: Employee[];
  selectedDate: Date;
  trigger: boolean; // Per scatenare il toast quando necessario
}

const DailyStatsToast: React.FC<DailyStatsToastProps> = ({
  appointments,
  employees,
  selectedDate,
  trigger
}) => {
  useEffect(() => {
    if (!trigger) return;

    const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
    
    // Filtra appuntamenti SOLO per il giorno selezionato (correzione del bug)
    const todayAppointments = appointments.filter(apt => {
      const isDateMatch = apt.date === selectedDateString;
      console.log('DEBUG - Filtro data:', { appointmentDate: apt.date, selectedDate: selectedDateString, match: isDateMatch });
      return isDateMatch;
    });
    
    console.log('DEBUG - Appuntamenti filtrati per oggi:', todayAppointments.length, 'su totali:', appointments.length);
    
    // Conta dipendenti attivi SOLO per oggi
    const activeEmployeeIds = new Set(todayAppointments.map(apt => apt.employeeId));
    const activeEmployeesCount = activeEmployeeIds.size;
    
    const message = `📊 Statistiche di ${format(selectedDate, 'dd/MM/yyyy')}: ${todayAppointments.length} appuntament${todayAppointments.length !== 1 ? 'i' : 'o'} e ${activeEmployeesCount} dipendent${activeEmployeesCount !== 1 ? 'i' : 'e'} attiv${activeEmployeesCount !== 1 ? 'i' : 'o'}`;
    
    toast.success(message, {
      duration: 3000,
    });
  }, [trigger, appointments, employees, selectedDate]);

  return null;
};

export default DailyStatsToast;
