
import { Appointment } from '@/types/appointment';
import { saveAppointmentWithRetry } from './saving/retryMechanism';
import { saveAppointmentsBatch } from './saving/batchSaving';
import { generateSuccessMessage } from './saving/successMessage';
import { getMobileDelays } from './saving/mobileDetection';

export const saveAppointments = async (
  mainAppointment: Appointment,
  additionalAppointments: Appointment[],
  recurringAppointments: Appointment[],
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[] = []
) => {
  const delays = getMobileDelays();
  
  console.log('🚀 INIZIO PROCESSO SALVATAGGIO MOBILE-OTTIMIZZATO:', {
    delays: {
      saveDelay: `${delays.saveDelay}ms`,
      additionalDelay: `${delays.additionalDelay}ms`,
      recurringDelay: `${delays.recurringDelay}ms`
    },
    mainAppointment: `${mainAppointment.client} - ${mainAppointment.date}`,
    additionalCount: additionalAppointments.length,
    recurringCount: recurringAppointments.length,
    totalToSave: 1 + additionalAppointments.length + recurringAppointments.length,
    isMobile: /Mobi|Android/i.test(navigator.userAgent)
  });

  const failedSaves: string[] = [];

  // 1. Salva appuntamento principale
  console.log('📋 1. SALVANDO APPUNTAMENTO PRINCIPALE...');
  try {
    const mainResult = await saveAppointmentWithRetry(mainAppointment, addAppointment, existingAppointments, 0, 1);
    if (!mainResult.success) {
      failedSaves.push(`Principale: ${mainResult.error}`);
    } else {
      console.log('✅ Appuntamento principale salvato con successo');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('❌ Errore nel salvare appuntamento principale:', errorMsg);
    failedSaves.push(`Principale: ${errorMsg}`);
  }

  // Pausa tra le fasi principali
  if (additionalAppointments.length > 0 || recurringAppointments.length > 0) {
    console.log(`⏳ PAUSA TRA FASI PRINCIPALI: ${delays.saveDelay}ms`);
    await new Promise(resolve => setTimeout(resolve, delays.saveDelay));
  }

  // 2. Salva appuntamenti aggiuntivi
  if (additionalAppointments.length > 0) {
    console.log('📋 2. INIZIANDO BATCH APPUNTAMENTI AGGIUNTIVI...');
    const additionalResult = await saveAppointmentsBatch(
      additionalAppointments,
      addAppointment,
      existingAppointments,
      'additional'
    );
    failedSaves.push(...additionalResult.failedSaves);
    
    // Pausa prima dei ricorrenti
    if (recurringAppointments.length > 0) {
      console.log(`⏳ PAUSA PRIMA RICORRENTI: ${delays.recurringDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, delays.recurringDelay));
    }
  }

  // 3. Salva appuntamenti ricorrenti - FASE PIÙ CRITICA
  if (recurringAppointments.length > 0) {
    console.log('📋 3. INIZIANDO BATCH APPUNTAMENTI RICORRENTI - FASE CRITICA:', {
      count: recurringAppointments.length,
      recurringDelay: delays.recurringDelay,
      tempoStimato: `${(recurringAppointments.length * delays.recurringDelay) / 1000}s`
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
