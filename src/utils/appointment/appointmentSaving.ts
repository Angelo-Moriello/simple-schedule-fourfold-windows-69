import { Appointment } from '@/types/appointment';
import { saveAppointmentSafely, saveMultipleAppointments, clearGeneratedIdsCache } from './saving/appointmentSaver';
import { toast } from 'sonner';

export const saveAppointments = async (
  mainAppointment: Appointment,
  additionalAppointments: Appointment[],
  recurringAppointments: Appointment[],
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[] = []
) => {
  console.log('🚀 INIZIO PROCESSO SALVATAGGIO APPUNTAMENTI:', {
    mainAppointment: `${mainAppointment.client} - ${mainAppointment.date}`,
    additionalCount: additionalAppointments.length,
    recurringCount: recurringAppointments.length,
    totalToSave: 1 + additionalAppointments.length + recurringAppointments.length
  });

  // Pulisce la cache degli ID all'inizio del processo
  clearGeneratedIdsCache();

  const failedSaves: string[] = [];

  try {
    // 1. Salva appuntamento principale
    console.log('📋 1. Salvando appuntamento principale...');
    const mainResult = await saveAppointmentSafely(mainAppointment, addAppointment);
    
    if (!mainResult.success) {
      failedSaves.push(`Principale: ${mainResult.error}`);
      console.error('❌ Errore nel salvare appuntamento principale:', mainResult.error);
      throw new Error(`Errore nel salvare appuntamento principale: ${mainResult.error}`);
    } else {
      console.log('✅ Appuntamento principale salvato con successo');
    }

    // 2. Salva appuntamenti aggiuntivi
    let additionalSavedCount = 0;
    if (additionalAppointments.length > 0) {
      console.log('📋 2. Salvando appuntamenti aggiuntivi...');
      
      const additionalResult = await saveMultipleAppointments(
        additionalAppointments,
        addAppointment,
        (saved, total) => {
          if (total > 1) {
            toast.loading(`Salvando eventi aggiuntivi: ${saved}/${total}...`);
          }
        }
      );
      
      additionalSavedCount = additionalResult.savedCount;
      failedSaves.push(...additionalResult.failedSaves);
      
      console.log('✅ Appuntamenti aggiuntivi completati:', {
        salvati: additionalResult.savedCount,
        richiesti: additionalAppointments.length
      });

      // Se falliscono tutti gli appuntamenti aggiuntivi, considera un errore critico
      if (additionalResult.savedCount === 0 && additionalAppointments.length > 0) {
        throw new Error(`Errore nel salvare tutti gli appuntamenti aggiuntivi`);
      }
    }

    // 3. Salva appuntamenti ricorrenti
    let savedRecurringCount = 0;
    if (recurringAppointments.length > 0) {
      console.log('📋 3. Salvando appuntamenti ricorrenti...');
      
      const recurringResult = await saveMultipleAppointments(
        recurringAppointments,
        addAppointment,
        (saved, total) => {
          if (total > 1) {
            toast.loading(`Salvando ricorrenti: ${saved}/${total}...`);
          }
        }
      );
      
      savedRecurringCount = recurringResult.savedCount;
      failedSaves.push(...recurringResult.failedSaves);
      
      console.log('✅ Appuntamenti ricorrenti completati:', {
        salvati: recurringResult.savedCount,
        richiesti: recurringAppointments.length
      });
    }

    console.log('🏁 PROCESSO SALVATAGGIO COMPLETATO:', {
      mainAppointment: 'Salvato',
      additionalEvents: `${additionalSavedCount}/${additionalAppointments.length}`,
      recurringEvents: `${savedRecurringCount}/${recurringAppointments.length}`,
      totalFailed: failedSaves.length
    });

    return { savedRecurringCount, failedSaves };

  } catch (error) {
    console.error('❌ Errore critico nel processo di salvataggio:', error);
    throw error; // Re-throw per permettere alla UI di gestire l'errore
  }
};

export const generateSuccessMessage = (
  totalMainEvents: number,
  savedRecurringCount: number,
  totalRecurringEvents: number,
  failedSaves: string[]
): string => {
  const mainSuccess = totalMainEvents > 1 
    ? `${totalMainEvents} appuntamenti principali creati`
    : 'Appuntamento creato';

  if (totalRecurringEvents === 0) {
    return `${mainSuccess} con successo!`;
  }

  if (savedRecurringCount === totalRecurringEvents && failedSaves.length === 0) {
    return `${mainSuccess} con ${savedRecurringCount} appuntamenti ricorrenti!`;
  }
  
  if (savedRecurringCount > 0) {
    return `${mainSuccess}. ${savedRecurringCount}/${totalRecurringEvents} appuntamenti ricorrenti salvati.`;
  }
  
  return `${mainSuccess}, ma i ricorrenti non sono stati salvati.`;
};
