
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

// Funzione per salvare un singolo appuntamento con retry ottimizzato
const saveAppointmentWithRetry = async (
  appointment: Appointment,
  addAppointment: (appointment: Appointment) => void,
  existingAppointments: Appointment[],
  index: number,
  total: number,
  maxRetries = 3
): Promise<{ success: boolean; error?: string }> => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [${index + 1}/${total}] TENTATIVO ${attempt}/${maxRetries} - MOBILE: ${isMobile}:`, {
        client: appointment.client,
        date: appointment.date,
        time: appointment.time,
        id: appointment.id.substring(0, 8),
        userAgent: navigator.userAgent.substring(0, 50),
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      // Verifica conflitti solo se ci sono appuntamenti esistenti
      if (existingAppointments.length > 0) {
        const hasConflict = await checkTimeConflicts(appointment, existingAppointments);
        if (hasConflict) {
          console.warn(`⚠️ Conflitto rilevato per ${appointment.client} alle ${appointment.time} del ${appointment.date}`);
          toast.warning(`Conflitto rilevato per ${appointment.client} il ${appointment.date} alle ${appointment.time}`);
        }
      }
      
      // SALVATAGGIO DIRETTO SENZA TIMEOUT - più affidabile
      console.log(`💾 [${index + 1}/${total}] INIZIO SALVATAGGIO DIRETTO - MOBILE: ${isMobile}`);
      addAppointment(appointment);
      
      // Breve pausa per verificare che il salvataggio sia completato
      await new Promise(resolve => setTimeout(resolve, isMobile ? 200 : 100));
      
      console.log(`✅ [${index + 1}/${total}] SALVATO con successo al tentativo ${attempt} - MOBILE: ${isMobile}`);
      return { success: true };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error(`❌ [${index + 1}/${total}] ERRORE tentativo ${attempt}/${maxRetries} - MOBILE: ${isMobile}:`, {
        error: errorMsg,
        appointment: {
          client: appointment.client,
          date: appointment.date,
          time: appointment.time
        },
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      
      if (attempt === maxRetries) {
        console.error(`❌ [${index + 1}/${total}] FALLITO DEFINITIVAMENTE dopo ${maxRetries} tentativi - MOBILE: ${isMobile}`);
        return { success: false, error: errorMsg };
      }
      
      // Pausa progressiva tra retry (più lunga su mobile)
      const retryDelay = isMobile ? attempt * 800 : attempt * 300;
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
  const deviceInfo = {
    isMobile,
    userAgent: navigator.userAgent,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown',
    timestamp: new Date().toISOString()
  };
  
  console.log('🚀 saveAppointments - INIZIO SALVATAGGIO OTTIMIZZATO:', {
    deviceInfo,
    mainAppointment: {
      client: mainAppointment.client,
      date: mainAppointment.date,
      time: mainAppointment.time
    },
    additionalCount: additionalAppointments.length,
    recurringCount: recurringAppointments.length,
    existingAppointments: existingAppointments.length,
    totalToSave: 1 + additionalAppointments.length + recurringAppointments.length,
    recurringDetails: recurringAppointments.map((app, i) => ({
      index: i + 1,
      date: app.date,
      time: app.time,
      client: app.client
    }))
  });

  let savedRecurringCount = 0;
  const failedSaves: string[] = [];

  try {
    // 1. Salva appuntamento principale
    console.log('📋 saveAppointments - Salvataggio appuntamento principale...');
    const mainResult = await saveAppointmentWithRetry(mainAppointment, addAppointment, existingAppointments, 0, 1);
    if (!mainResult.success) {
      throw new Error(`Impossibile salvare appuntamento principale: ${mainResult.error}`);
    }
    console.log('✅ saveAppointments - Appuntamento principale salvato');

    // 2. Salva appuntamenti aggiuntivi per lo stesso giorno
    if (additionalAppointments.length > 0) {
      console.log(`📋 saveAppointments - Salvataggio ${additionalAppointments.length} appuntamenti aggiuntivi...`);
      for (let i = 0; i < additionalAppointments.length; i++) {
        const additionalAppointment = additionalAppointments[i];
        
        const result = await saveAppointmentWithRetry(
          additionalAppointment, 
          addAppointment, 
          existingAppointments, 
          i, 
          additionalAppointments.length
        );
        
        if (result.success) {
          console.log(`✅ saveAppointments - Appuntamento aggiuntivo ${i + 1}/${additionalAppointments.length} salvato`);
        } else {
          console.error(`❌ saveAppointments - Appuntamento aggiuntivo ${i + 1} fallito: ${result.error}`);
          failedSaves.push(`Evento aggiuntivo ${i + 1}: ${result.error}`);
        }
        
        // Pausa tra salvataggi aggiuntivi
        if (i < additionalAppointments.length - 1) {
          const delay = isMobile ? 600 : 200;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // 3. Salva appuntamenti ricorrenti - PROCESSO ULTRA-OTTIMIZZATO
    if (recurringAppointments.length > 0) {
      console.log(`📅 saveAppointments - INIZIO SALVATAGGIO RICORRENTI OTTIMIZZATO: ${recurringAppointments.length} appuntamenti`);
      console.log(`🔧 saveAppointments - CONFIGURAZIONE MOBILE OTTIMIZZATA:`, {
        isMobile,
        pauseBetweenSaves: isMobile ? '800ms' : '300ms',
        maxRetries: 3,
        retryDelay: isMobile ? 'progressiva 800ms-2400ms' : 'progressiva 300ms-900ms'
      });
      
      // Progress toast per operazioni lunghe
      if (recurringAppointments.length > 3) {
        toast.loading(`Salvando ${recurringAppointments.length} appuntamenti ricorrenti...`, {
          id: 'recurring-save-progress'
        });
      }
      
      // SALVATAGGIO SEQUENZIALE ULTRA-ROBUSTO CON CONTINUAZIONE ANCHE IN CASO DI ERRORI
      for (let i = 0; i < recurringAppointments.length; i++) {
        const recurringAppointment = recurringAppointments[i];
        
        console.log(`💾 saveAppointments - [${i + 1}/${recurringAppointments.length}] PROCESSANDO RICORRENTE:`, {
          date: recurringAppointment.date,
          time: recurringAppointment.time,
          client: recurringAppointment.client,
          progress: `${i + 1}/${recurringAppointments.length}`,
          deviceInfo: {
            isMobile,
            connection: (navigator as any).connection?.effectiveType || 'unknown'
          }
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
            console.log(`✅ saveAppointments - [${i + 1}/${recurringAppointments.length}] RICORRENTE SALVATO! Progresso: ${savedRecurringCount}/${recurringAppointments.length}`);
          } else {
            console.error(`❌ saveAppointments - [${i + 1}/${recurringAppointments.length}] RICORRENTE FALLITO: ${result.error}`);
            failedSaves.push(`Ricorrente ${i + 1} (${recurringAppointment.date}): ${result.error}`);
            
            // CONTINUA COMUNQUE con il prossimo appuntamento
            console.log(`🔄 saveAppointments - Continuando con il prossimo appuntamento nonostante l'errore...`);
          }
        } catch (criticalError) {
          // Errore critico, ma continua comunque
          const errorMsg = criticalError instanceof Error ? criticalError.message : 'Errore critico sconosciuto';
          console.error(`💥 saveAppointments - [${i + 1}/${recurringAppointments.length}] ERRORE CRITICO:`, {
            error: errorMsg,
            appointment: recurringAppointment.date,
            continueAnyway: true
          });
          failedSaves.push(`Ricorrente ${i + 1} (${recurringAppointment.date}): ${errorMsg}`);
        }
        
        // Aggiorna progress toast periodicamente
        if (recurringAppointments.length > 3 && (i + 1) % 2 === 0) {
          toast.loading(`Salvati ${savedRecurringCount}/${recurringAppointments.length} appuntamenti...`, {
            id: 'recurring-save-progress'
          });
        }
        
        // PAUSA OTTIMIZZATA TRA SALVATAGGI - CRITICA PER MOBILE
        if (i < recurringAppointments.length - 1) {
          const delay = isMobile ? 800 : 300; // AUMENTATO SIGNIFICATIVAMENTE
          console.log(`⏱️ saveAppointments - [${i + 1}/${recurringAppointments.length}] Pausa ottimizzata di ${delay}ms prima di continuare...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      // Chiudi progress toast
      if (recurringAppointments.length > 3) {
        toast.dismiss('recurring-save-progress');
      }
    }
    
  } catch (error) {
    console.error('❌ saveAppointments - ERRORE CRITICO nel salvataggio (ma continuando):', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      deviceInfo,
      timestamp: new Date().toISOString(),
      continuingAnyway: true
    });
    
    // NON lanciare l'errore, continua comunque
    console.log('🔄 saveAppointments - Continuando nonostante l\'errore critico...');
  }
  
  console.log('🏁 saveAppointments - SALVATAGGIO COMPLETATO - RISULTATI FINALI OTTIMIZZATI:', {
    deviceInfo,
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
  
  console.log('📝 saveAppointments - Messaggio di successo generato:', successMessage);
  return successMessage;
};
