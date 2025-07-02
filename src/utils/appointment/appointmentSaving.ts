
import { toast } from 'sonner';
import { Appointment } from '@/types/appointment';

// Funzione per verificare conflitti di orario
const checkTimeConflicts = async (
  newAppointment: Appointment,
  existingAppointments: Appointment[]
): Promise<boolean> => {
  const newStartTime = new Date(`${newAppointment.date}T${newAppointment.time}`);
  const newEndTime = new Date(newStartTime.getTime() + newAppointment.duration * 60000);
  
  for (const existing of existingAppointments) {
    if (existing.employeeId === newAppointment.employeeId && 
        existing.date === newAppointment.date) {
      
      const existingStartTime = new Date(`${existing.date}T${existing.time}`);
      const existingEndTime = new Date(existingStartTime.getTime() + existing.duration * 60000);
      
      // Verifica sovrapposizione
      if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
        console.warn(`Conflitto rilevato per ${newAppointment.client} alle ${newAppointment.time} del ${newAppointment.date}`);
        return true;
      }
    }
  }
  return false;
};

// Funzione SEMPLIFICATA per salvare un singolo appuntamento
const saveAppointmentWithRetry = async (
  appointment: Appointment,
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[],
  index: number,
  total: number,
  maxRetries = 5
): Promise<{ success: boolean; error?: string }> => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 [${index + 1}/${total}] TENTATIVO ${attempt}/${maxRetries} - MOBILE: ${isMobile}`, {
      client: appointment.client,
      date: appointment.date,
      time: appointment.time,
      id: appointment.id.substring(0, 8),
      timestamp: new Date().toISOString()
    });
    
    try {
      // Verifica conflitti solo se ci sono appuntamenti esistenti
      if (existingAppointments.length > 0) {
        const hasConflict = await checkTimeConflicts(appointment, existingAppointments);
        if (hasConflict) {
          console.warn(`⚠️ Conflitto rilevato per ${appointment.client} alle ${appointment.time} del ${appointment.date}`);
          toast.warning(`Conflitto rilevato per ${appointment.client} il ${appointment.date} alle ${appointment.time}`);
        }
      }
      
      // SALVATAGGIO DIRETTO - SEMPLICE E ROBUSTO
      console.log(`💾 [${index + 1}/${total}] INIZIO SALVATAGGIO DIRETTO`);
      
      // Chiamata diretta senza try-catch interno per non nascondere errori
      addAppointment(appointment);
      
      // Pausa breve per assicurarsi che il salvataggio sia completato
      await new Promise(resolve => setTimeout(resolve, isMobile ? 300 : 150));
      
      console.log(`✅ [${index + 1}/${total}] SALVATO CON SUCCESSO al tentativo ${attempt}`);
      return { success: true };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error(`❌ [${index + 1}/${total}] ERRORE tentativo ${attempt}/${maxRetries}:`, {
        error: errorMsg,
        appointment: {
          client: appointment.client,
          date: appointment.date,
          time: appointment.time
        },
        timestamp: new Date().toISOString()
      });
      
      if (attempt === maxRetries) {
        console.error(`❌ [${index + 1}/${total}] FALLITO DEFINITIVAMENTE dopo ${maxRetries} tentativi`);
        return { success: false, error: errorMsg };
      }
      
      // Pausa progressiva tra retry
      const retryDelay = isMobile ? attempt * 1000 : attempt * 500;
      console.log(`⏱️ [${index + 1}/${total}] Pausa retry di ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  return { success: false, error: 'Fallito dopo tutti i tentativi' };
};

export const saveAppointments = async (
  mainAppointment: Appointment,
  additionalAppointments: Appointment[],
  recurringAppointments: Appointment[],
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[] = []
) => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  
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

  let savedRecurringCount = 0;
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
  if (additionalAppointments.length > 0) {
    console.log(`📋 Salvataggio ${additionalAppointments.length} appuntamenti aggiuntivi...`);
    for (let i = 0; i < additionalAppointments.length; i++) {
      try {
        const result = await saveAppointmentWithRetry(
          additionalAppointments[i], 
          addAppointment, 
          existingAppointments, 
          i, 
          additionalAppointments.length
        );
        
        if (result.success) {
          console.log(`✅ Appuntamento aggiuntivo ${i + 1}/${additionalAppointments.length} salvato`);
        } else {
          console.error(`❌ Appuntamento aggiuntivo ${i + 1} fallito:`, result.error);
          failedSaves.push(`Evento aggiuntivo ${i + 1}: ${result.error}`);
        }
        
        // Pausa tra salvataggi aggiuntivi
        if (i < additionalAppointments.length - 1) {
          const delay = isMobile ? 1000 : 500;
          console.log(`⏱️ Pausa tra appuntamenti aggiuntivi: ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`❌ Errore critico appuntamento aggiuntivo ${i + 1}:`, error);
        failedSaves.push(`Evento aggiuntivo ${i + 1}: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      }
    }
  }

  // 3. Salva appuntamenti ricorrenti - PROCESSO ULTRA-SEMPLIFICATO
  if (recurringAppointments.length > 0) {
    console.log(`📅 INIZIO SALVATAGGIO RICORRENTI: ${recurringAppointments.length} appuntamenti`);
    
    // Progress toast per operazioni lunghe
    if (recurringAppointments.length > 3) {
      toast.loading(`Salvando ${recurringAppointments.length} appuntamenti ricorrenti...`, {
        id: 'recurring-save-progress'
      });
    }
    
    // SALVATAGGIO SEQUENZIALE ULTRA-ROBUSTO - NESSUNA INTERRUZIONE
    for (let i = 0; i < recurringAppointments.length; i++) {
      const recurringAppointment = recurringAppointments[i];
      
      console.log(`💾 [${i + 1}/${recurringAppointments.length}] PROCESSANDO RICORRENTE:`, {
        date: recurringAppointment.date,
        time: recurringAppointment.time,
        client: recurringAppointment.client,
        progress: `${i + 1}/${recurringAppointments.length}`
      });
      
      try {
        const result = await saveAppointmentWithRetry(
          recurringAppointment, 
          addAppointment, 
          existingAppointments, 
          i, 
          recurringAppointments.length
        );
        
        if (result.success) {
          savedRecurringCount++;
          console.log(`✅ [${i + 1}/${recurringAppointments.length}] RICORRENTE SALVATO! Progresso: ${savedRecurringCount}/${recurringAppointments.length}`);
        } else {
          console.error(`❌ [${i + 1}/${recurringAppointments.length}] RICORRENTE FALLITO:`, result.error);
          failedSaves.push(`Ricorrente ${i + 1} (${recurringAppointment.date}): ${result.error}`);
        }
      } catch (criticalError) {
        const errorMsg = criticalError instanceof Error ? criticalError.message : 'Errore critico sconosciuto';
        console.error(`💥 [${i + 1}/${recurringAppointments.length}] ERRORE CRITICO:`, {
          error: errorMsg,
          appointment: recurringAppointment.date
        });
        failedSaves.push(`Ricorrente ${i + 1} (${recurringAppointment.date}): ${errorMsg}`);
      }
      
      // Aggiorna progress toast periodicamente
      if (recurringAppointments.length > 3 && (i + 1) % 2 === 0) {
        toast.loading(`Salvati ${savedRecurringCount}/${recurringAppointments.length} appuntamenti...`, {
          id: 'recurring-save-progress'
        });
      }
      
      // PAUSA FONDAMENTALE TRA SALVATAGGI - MAI SALTARE
      if (i < recurringAppointments.length - 1) {
        const delay = isMobile ? 1200 : 600; // AUMENTATO ANCORA
        console.log(`⏱️ [${i + 1}/${recurringAppointments.length}] PAUSA OBBLIGATORIA di ${delay}ms prima di continuare...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Chiudi progress toast
    if (recurringAppointments.length > 3) {
      toast.dismiss('recurring-save-progress');
    }
  }
  
  console.log('🏁 PROCESSO COMPLETATO - RISULTATI FINALI:', {
    results: {
      savedRecurringCount,
      totalRequested: recurringAppointments.length,
      failedSaves: failedSaves.length,
      successRate: recurringAppointments.length > 0 ? `${Math.round((savedRecurringCount / recurringAppointments.length) * 100)}%` : '100%'
    },
    failedDetails: failedSaves,
    summary: {
      main: '✅',
      additional: additionalAppointments.length,
      recurring: `${savedRecurringCount}/${recurringAppointments.length}`
    }
  });
  
  return { savedRecurringCount, failedSaves };
};

export const generateSuccessMessage = (
  totalMainEvents: number,
  savedRecurringCount: number,
  totalRecurringRequested: number,
  failedSaves: string[] = []
): string => {
  let successMessage = `${totalMainEvents} appuntament${totalMainEvents > 1 ? 'i creati' : 'o creato'} con successo!`;
  
  if (savedRecurringCount > 0) {
    successMessage += ` Inoltre ${savedRecurringCount} appuntament${savedRecurringCount > 1 ? 'i ricorrenti creati' : 'o ricorrente creato'}`;
    
    if (totalRecurringRequested > savedRecurringCount) {
      successMessage += ` su ${totalRecurringRequested} richiesti`;
    }
    successMessage += '.';
  }
  
  if (failedSaves.length > 0) {
    successMessage += ` Attenzione: ${failedSaves.length} salvataggi non riusciti.`;
  }
  
  console.log('📝 Messaggio di successo generato:', successMessage);
  return successMessage;
};
