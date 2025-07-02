
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
  
  console.log('🚀 INIZIO PROCESSO SALVATAGGIO OTTIMIZZATO:', {
    isMobile,
    mainAppointment: mainAppointment.date,
    additionalCount: additionalAppointments.length,
    recurringCount: recurringAppointments.length,
    totalToSave: 1 + additionalAppointments.length + recurringAppointments.length
  });

  const failedSaves: string[] = [];

  // 1. Salva appuntamento principale
  console.log('📋 1. Salvando appuntamento principale...');
  try {
    const mainResult = await saveAppointmentWithRetry(mainAppointment, addAppointment, existingAppointments, 0, 1);
    if (!mainResult.success) {
      failedSaves.push(`Principale: ${mainResult.error}`);
    } else {
      console.log('✅ Appuntamento principale salvato');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
    failedSaves.push(`Principale: ${errorMsg}`);
  }

  // Pausa minima tra fasi
  if (additionalAppointments.length > 0 || recurringAppointments.length > 0) {
    await new Promise(resolve => setTimeout(resolve, isMobile ? 500 : 200));
  }

  // 2. Salva appuntamenti aggiuntivi
  if (additionalAppointments.length > 0) {
    console.log('📋 2. Salvando appuntamenti aggiuntivi...');
    const additionalResult = await saveAppointmentsBatch(
      additionalAppointments,
      addAppointment,
      existingAppointments,
      'additional'
    );
    failedSaves.push(...additionalResult.failedSaves);
    
    // Pausa prima dei ricorrenti
    if (recurringAppointments.length > 0) {
      await new Promise(resolve => setTimeout(resolve, isMobile ? 500 : 200));
    }
  }

  // 3. Salva appuntamenti ricorrenti - LA PARTE PIÙ CRITICA
  if (recurringAppointments.length > 0) {
    console.log('📋 3. Salvando appuntamenti ricorrenti - FASE CRITICA:', {
      count: recurringAppointments.length,
      dates: recurringAppointments.map(a => a.date).slice(0, 5), // primi 5 per debug
      isMobile
    });
    
    const recurringResult = await saveAppointmentsBatch(
      recurringAppointments,
      addAppointment,
      existingAppointments,
      'recurring'
    );
    failedSaves.push(...recurringResult.failedSaves);
    
    console.log('🏁 RISULTATO FINALE RICORRENTI:', {
      salvati: recurringResult.savedCount,
      richiesti: recurringAppointments.length,
      falliti: recurringResult.failedSaves.length,
      successRate: `${Math.round((recurringResult.savedCount / recurringAppointments.length) * 100)}%`
    });
    
    return { savedRecurringCount: recurringResult.savedCount, failedSaves };
  }
  
  return { savedRecurringCount: 0, failedSaves };
};

// Re-export for backward compatibility
export { generateSuccessMessage } from './saving/successMessage';
