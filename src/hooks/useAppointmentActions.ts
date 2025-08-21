
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
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  forcePageRefresh: () => void;
}

export const useAppointmentActions = ({ appointments, setAppointments, forcePageRefresh }: UseAppointmentActionsProps) => {
  const addAppointment = async (newAppointment: Appointment) => {
    try {
      console.log('DEBUG - Aggiunta appuntamento:', newAppointment);
      
      // Aggiorna immediatamente l'UI per feedback immediato
      setAppointments((prev) => {
        const exists = prev.some(a => a.id === newAppointment.id);
        return exists ? prev : [...prev, newAppointment];
      });
      
      // Salva nel database
      await addAppointmentToSupabase(newAppointment);
      console.log('✅ Appuntamento salvato con successo nel database');
      toast.success('Appuntamento aggiunto con successo!');
      
      // Refresh automatico della pagina dopo 2 secondi (tempo maggiore per sicurezza)
      setTimeout(forcePageRefresh, 2000);
    } catch (error) {
      console.error('Errore nell\'aggiungere l\'appuntamento:', error);
      // Se il salvataggio fallisce, rimuovi dall'UI
      setAppointments((prev) => prev.filter(a => a.id !== newAppointment.id));
      toast.error('Errore nell\'aggiungere l\'appuntamento');
    }
  };

  const updateAppointment = async (updatedAppointment: Appointment) => {
    try {
      console.log('DEBUG - Aggiornamento appuntamento:', updatedAppointment);
      await updateAppointmentInSupabase(updatedAppointment);
      console.log('✅ Appuntamento aggiornato con successo nel database');
      toast.success('Appuntamento modificato con successo!');
      setTimeout(forcePageRefresh, 2000);
    } catch (error) {
      console.error('Errore nella modifica dell\'appuntamento:', error);
      toast.error('Errore nella modifica dell\'appuntamento');
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    try {
      console.log('DEBUG - Eliminazione appuntamento:', appointmentId);
      await deleteAppointmentFromSupabase(appointmentId);
      console.log('✅ Appuntamento eliminato con successo dal database');
      toast.success('Appuntamento eliminato con successo!');
      
      // Aspetta un po' di più per assicurarsi che l'operazione sia completata
      setTimeout(forcePageRefresh, 2000);
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'appuntamento:', error);
      toast.error('Errore nell\'eliminazione dell\'appuntamento');
      // Non fare refresh se c'è un errore
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
