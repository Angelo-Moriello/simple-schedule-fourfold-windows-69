
import { toast } from 'sonner';
import { Appointment, Employee } from '@/types/appointment';
import { 
  addAppointmentToSupabase,
  updateAppointmentInSupabase,
  deleteAppointmentFromSupabase,
  addEmployeeToSupabase,
  updateEmployeeInSupabase,
  deleteEmployeeFromSupabase
} from '@/utils/supabaseStorage';

interface UseAppointmentActionsProps {
  appointments: Appointment[];
  forcePageRefresh: () => void;
}

export const useAppointmentActions = ({ appointments, forcePageRefresh }: UseAppointmentActionsProps) => {
  const addAppointment = async (newAppointment: Appointment) => {
    try {
      console.log('DEBUG - Aggiunta appuntamento:', newAppointment);
      await addAppointmentToSupabase(newAppointment);
      console.log('✅ Appuntamento aggiunto con successo, avvio refresh...');
      toast.success('Appuntamento aggiunto con successo!');
      setTimeout(() => {
        console.log('🔄 Eseguendo refresh dopo aggiunta appuntamento...');
        forcePageRefresh();
      }, 1000);
    } catch (error) {
      console.error('Errore nell\'aggiungere l\'appuntamento:', error);
      toast.error('Errore nell\'aggiungere l\'appuntamento');
    }
  };

  const updateAppointment = async (updatedAppointment: Appointment) => {
    try {
      console.log('DEBUG - Aggiornamento appuntamento:', updatedAppointment);
      await updateAppointmentInSupabase(updatedAppointment);
      toast.success('Appuntamento modificato con successo!');
      setTimeout(forcePageRefresh, 1000);
    } catch (error) {
      console.error('Errore nella modifica dell\'appuntamento:', error);
      toast.error('Errore nella modifica dell\'appuntamento');
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    try {
      console.log('DEBUG - Eliminazione appuntamento:', appointmentId);
      await deleteAppointmentFromSupabase(appointmentId);
      toast.success('Appuntamento eliminato con successo!');
      setTimeout(forcePageRefresh, 1000);
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'appuntamento:', error);
      toast.error('Errore nell\'eliminazione dell\'appuntamento');
    }
  };

  const addEmployee = async (newEmployee: Employee) => {
    try {
      await addEmployeeToSupabase(newEmployee);
      toast.success('Dipendente aggiunto con successo!');
    } catch (error) {
      console.error('Errore nell\'aggiungere il dipendente:', error);
      toast.error('Errore nell\'aggiungere il dipendente');
    }
  };

  const updateEmployee = async (updatedEmployee: Employee) => {
    try {
      await updateEmployeeInSupabase(updatedEmployee);
      toast.success('Dipendente modificato con successo!');
    } catch (error) {
      console.error('Errore nella modifica del dipendente:', error);
      toast.error('Errore nella modifica del dipendente');
    }
  };

  const deleteEmployee = async (employeeId: number) => {
    try {
      const employeeAppointments = appointments.filter(appointment => appointment.employeeId === employeeId);
      for (const appointment of employeeAppointments) {
        await deleteAppointmentFromSupabase(appointment.id);
      }
      
      await deleteEmployeeFromSupabase(employeeId);
      
      toast.success('Dipendente eliminato con successo!');
    } catch (error) {
      console.error('Errore nell\'eliminazione del dipendente:', error);
      toast.error('Errore nell\'eliminazione del dipendente');
    }
  };

  const updateEmployeeName = async (employeeId: number, newName: string, employees: Employee[]) => {
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        const updatedEmployee = { ...employee, name: newName };
        await updateEmployeeInSupabase(updatedEmployee);
        toast.success('Nome dipendente aggiornato con successo!');
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento del nome:', error);
      toast.error('Errore nell\'aggiornamento del nome');
    }
  };

  const handleUpdateEmployeeVacations = async (employeeId: number, vacations: string[], employees: Employee[]) => {
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        const updatedEmployee = { ...employee, vacations };
        await updateEmployeeInSupabase(updatedEmployee);
        toast.success('Ferie aggiornate con successo!');
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle ferie:', error);
      toast.error('Errore nell\'aggiornamento delle ferie');
    }
  };

  return {
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateEmployeeName,
    handleUpdateEmployeeVacations
  };
};
