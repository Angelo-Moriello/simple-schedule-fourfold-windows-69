
import { Appointment } from '@/types/appointment';
import { saveAppointmentWithRetry } from './saving/retryMechanism';
import { saveAppointmentsBatch } from './saving/batchSaving';
import { generateSuccessMessage } from './saving/successMessage';
import { isMobileDevice } from './saving/mobileDetection';

export const saveAppointments = async (
  mainAppointment: Appointment,
  additionalAppointments: Appointment[],
  recurringAppointments: Appointment[],
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[] = []
) => {
  const isMobile = isMobileDevice();
  
  console.log('🚀 saveAppointments - INIZIO PROCESSO SALVATAGGIO SEMPLIFICATO:', {
    isMobile,
    mainAppointment: {
      client: mainAppointment.client,
      date: mainAppointment.date,
      time: mainAppointment.time
    },
    additionalCount: additionalAppointments.length,
    recurringCount: recurringAppointments.length,
    totalToSave: 1 + additionalAppointments.length + recurringAppointments.length
  });

  const failedSaves: string[] = [];

  // 1. Salva appuntamento principale
  console.log('📋 Salvataggio appuntamento principale...');
  try {
    const mainResult = await saveAppointmentWithRetry(mainAppointment, addAppointment, existingAppointments, 0, 1);
    if (!mainResult.success) {
      console.error('❌ Appuntamento principale fallito:', mainResult.error);
      failedSaves.push(`Appuntamento principale: ${mainResult.error}`);
    } else {
      console.log('✅ Appuntamento principale salvato');
    }
  } catch (error) {
    console.error('❌ Errore critico appuntamento principale:', error);
    failedSaves.push(`Appuntamento principale: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
  }

  // 2. Salva appuntamenti aggiuntivi
  const additionalResult = await saveAppointmentsBatch(
    additionalAppointments,
    addAppointment,
    existingAppointments,
    'additional'
  );
  failedSaves.push(...additionalResult.failedSaves);

  // 3. Salva appuntamenti ricorrenti
  const recurringResult = await saveAppointmentsBatch(
    recurringAppointments,
    addAppointment,
    existingAppointments,
    'recurring'
  );
  failedSaves.push(...recurringResult.failedSaves);
  
  console.log('🏁 PROCESSO COMPLETATO - RISULTATI FINALI:', {
    results: {
      savedRecurringCount: recurringResult.savedCount,
      totalRequested: recurringAppointments.length,
      failedSaves: failedSaves.length,
      successRate: recurringAppointments.length > 0 ? `${Math.round((recurringResult.savedCount / recurringAppointments.length) * 100)}%` : '100%'
    },
    failedDetails: failedSaves,
    summary: {
      main: '✅',
      additional: additionalResult.savedCount,
      recurring: `${recurringResult.savedCount}/${recurringAppointments.length}`
    }
  });
  
  return { savedRecurringCount: recurringResult.savedCount, failedSaves };
};

// Re-export for backward compatibility
export { generateSuccessMessage } from './saving/successMessage';
