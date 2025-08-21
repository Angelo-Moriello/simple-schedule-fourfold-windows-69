
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';
import { 
  saveAppointments, 
  generateSuccessMessage 
} from '@/utils/appointment/appointmentSaving';
import { validateAppointment } from '@/utils/appointment/saving/appointmentValidator';

export const useAppointmentSaving = () => {
  const handleSaveAppointments = async (
    mainAppointment: Appointment,
    additionalAppointments: Appointment[],
    recurringAppointments: Appointment[],
    addAppointment: ((appointment: Appointment) => void) | undefined,
    existingAppointments: Appointment[]
  ) => {
    console.log('🔍 DEBUGGING - Start handleSaveAppointments:', {
      addAppointmentExists: !!addAppointment,
      addAppointmentType: typeof addAppointment
    });

    if (!addAppointment) {
      console.error('addAppointment function is missing');
      toast.error('Errore interno: funzione di salvataggio mancante');
      return;
    }

    // Validazione appuntamento principale
    const mainValidation = validateAppointment(mainAppointment);
    if (!mainValidation.isValid) {
      console.error('Appuntamento principale non valido:', mainValidation.errors);
      toast.error(`Errore: ${mainValidation.errors.join(', ')}`);
      return;
    }

    console.log('💾 AppointmentSaving - INIZIO PROCESSO DI SALVATAGGIO:', {
      mainAppointment: 1,
      additionalAppointments: additionalAppointments.length,
      recurringAppointments: recurringAppointments.length,
      totalToSave: 1 + additionalAppointments.length + recurringAppointments.length
    });
    
    try {
      console.log('🔍 DEBUGGING - About to call saveAppointments');
      
      const result = await saveAppointments(
        mainAppointment,
        additionalAppointments,
        recurringAppointments,
        addAppointment,
        existingAppointments
      );
      
      console.log('🔍 DEBUGGING - saveAppointments returned:', result);
      
      const totalMainEvents = 1 + additionalAppointments.length;
      const successMessage = generateSuccessMessage(
        totalMainEvents,
        result.savedRecurringCount,
        recurringAppointments.length,
        result.failedSaves
      );
      
      console.log('🏆 AppointmentSaving - RISULTATO FINALE:', {
        mainEvents: totalMainEvents,
        recurringEvents: result.savedRecurringCount,
        totalRecurringExpected: recurringAppointments.length,
        failedSaves: result.failedSaves.length,
        successRate: recurringAppointments.length > 0 ? `${Math.round((result.savedRecurringCount / recurringAppointments.length) * 100)}%` : '100%',
        successMessage
      });
      
      // Mostra sempre successo se il principale e aggiuntivi sono stati salvati
      // Solo i ricorrenti possono fallire parzialmente
      if (result.failedSaves.length === 0) {
        toast.success(successMessage);
      } else if (result.savedRecurringCount > 0) {
        toast.success(successMessage);
      } else {
        // Solo se tutti i ricorrenti falliscono mostra warning
        toast.success(`Appuntamento principale creato! Alcuni ricorrenti non sono stati salvati: ${result.failedSaves.length} falliti`);
      }
      
      // Rimosso il reload forzato - le subscription realtime aggiorneranno automaticamente la UI
      console.log('✅ Salvataggio completato, la UI verrà aggiornata automaticamente dalle subscription realtime');
      
    } catch (error) {
      console.error('❌ Errore critico nel processo di salvataggio:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Mostra errore senza forzare il reload
      toast.error('Errore nel salvataggio degli appuntamenti');
    }
  };

  return { handleSaveAppointments };
};
