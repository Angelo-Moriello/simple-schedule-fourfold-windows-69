
export const getOccupiedSlots = (appointments: any[], employeeId: number, date: string) => {
  const occupiedSlots = new Set<string>();
  
  appointments
    .filter(apt => apt.employeeId === employeeId && apt.date === date)
    .forEach(appointment => {
      const startTime = appointment.time;
      const duration = appointment.duration;
      
      // Converti l'orario di inizio in minuti
      const [startHours,  startMinutes] = startTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      
      // Calcola tutti gli slot occupati in base alla durata
      for (let i = 0; i < duration; i += 30) {
        const currentMinutes = startTotalMinutes + i;
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;
        const timeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        occupiedSlots.add(timeSlot);
      }
    });
  
  return occupiedSlots;
};

export const isSlotOccupied = (time: string, occupiedSlots: Set<string>) => {
  return occupiedSlots.has(time);
};
