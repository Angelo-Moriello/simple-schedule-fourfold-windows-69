
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
  
  console.log('🚀 saveAppointments - INIZIO PROCESSO SALVATAGGIO MIGLIORATO:', {
    isMobile,
    mainAppointment: {
      client: mainAppointment.client,
      date: mainAppointment.date,
      time: mainAppointment.time
    },
    additionalCount: additionalAppointments.length,
    recurringCount: recurringAppointments.length,
    totalToSave: 1 + additionalAppointments.length + recurringAppointments.length,
    userAgent: navigator.userAgent.substring(0, 50)
  });

  const failedSaves: string[] = [];

  // 1. Salva appuntamento principale con pausa extra
  console.log('📋 Salvataggio appuntamento principale...');
  try {
    const mainResult = await saveAppointmentWithRetry(mainAppointment, addAppointment, existingAppointments, 0, 1);
    if (!mainResult.success) {
      console.error('❌ Appuntamento principale fallito:', mainResult.error);
      failedSaves.push(`Appuntamento principale: ${mainResult.error}`);
    } else {
      console.log('✅ Appuntamento principale salvato');
      // Pausa extra dopo il principale
      await new Promise(resolve => setTimeout(resolve, isMobile ? 1000 : 500));
    }
  } catch (error) {
    console.error('❌ Errore critico appuntamento principale:', error);
    failedSaves.push(`Appuntamento principale: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
  }

  // 2. Salva appuntamenti aggiuntivi con pausa
  if (additionalAppointments.length > 0) {
    console.log('📋 Pausa prima degli appuntamenti aggiuntivi...');
    await new Promise(resolve => setTimeout(resolve, isMobile ? 1500 : 700));
    
    const additionalResult = await saveAppointmentsBatch(
      additionalAppointments,
      addAppointment,
      existingAppointments,
      'additional'
    );
    failedSaves.push(...additionalResult.failedSaves);
  }

  // 3. Salva appuntamenti ricorrenti con pausa maggiore
  if (recurringAppointments.length > 0) {
    console.log('📋 Pausa extra prima degli appuntamenti ricorrenti...');
    await new Promise(resolve => setTimeout(resolve, isMobile ? 2000 : 1000));
    
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
        additional: additionalAppointments.length,
        recurring: `${recurringResult.savedCount}/${recurringAppointments.length}`
      },
      deviceInfo: {
        isMobile,
        userAgent: navigator.userAgent.substring(0, 100)
      }
    });
    
    return { savedRecurringCount: recurringResult.savedCount, failedSaves };
  }
  
  return { savedRecurringCount: 0, failedSaves };
};

// Re-export for backward compatibility
export { generateSuccessMessage } from './saving/successMessage';
