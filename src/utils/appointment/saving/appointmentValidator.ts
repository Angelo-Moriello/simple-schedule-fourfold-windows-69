
import { Appointment } from '@/types/appointment';

export const validateAppointment = (appointment: Appointment): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!appointment.client?.trim()) {
    errors.push('Nome cliente mancante');
  }

  if (!appointment.serviceType?.trim()) {
    errors.push('Tipo di servizio mancante');
  }

  if (!appointment.date) {
    errors.push('Data mancante');
  }

  if (!appointment.time) {
    errors.push('Orario mancante');
  }

  if (!appointment.employeeId) {
    errors.push('Dipendente mancante');
  }

  if (appointment.duration <= 0) {
    errors.push('Durata non valida');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const checkTimeConflicts = (
  newAppointment: Appointment,
  existingAppointments: Appointment[]
): boolean => {
  const newStartTime = new Date(`${newAppointment.date}T${newAppointment.time}`);
  const newEndTime = new Date(newStartTime.getTime() + newAppointment.duration * 60000);
  
  for (const existing of existingAppointments) {
    if (existing.employeeId === newAppointment.employeeId && 
        existing.date === newAppointment.date &&
        existing.id !== newAppointment.id) {
      
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
