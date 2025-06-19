
// Utility per gestire la persistenza dei dati tra diverse istanze dell'app
export const saveAppointments = (appointments: any[]) => {
  localStorage.setItem('appointments', JSON.stringify(appointments));
  // Salva anche un timestamp per verificare la sincronizzazione
  localStorage.setItem('appointmentsTimestamp', Date.now().toString());
};

export const loadAppointments = (): any[] => {
  try {
    const stored = localStorage.getItem('appointments');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Errore nel caricamento degli appuntamenti:', error);
    return [];
  }
};

export const saveEmployees = (employees: any[]) => {
  localStorage.setItem('employees', JSON.stringify(employees));
  localStorage.setItem('employeesTimestamp', Date.now().toString());
};

export const loadEmployees = (): any[] => {
  try {
    const stored = localStorage.getItem('employees');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Errore nel caricamento dei dipendenti:', error);
    return [];
  }
};

// Funzione per sincronizzare i dati quando l'app si ricarica
export const syncData = () => {
  // Forza il reload dei dati dal localStorage
  window.dispatchEvent(new Event('storage'));
};
