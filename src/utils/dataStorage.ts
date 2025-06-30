
// Utility per gestire la persistenza dei dati tra diverse istanze dell'app

// Enhanced data validation
const validateAppointments = (appointments: any[]): boolean => {
  if (!Array.isArray(appointments)) return false;
  return appointments.every(apt => 
    apt && 
    typeof apt.id === 'string' && 
    typeof apt.employeeId === 'number' && 
    typeof apt.date === 'string' &&
    typeof apt.time === 'string'
  );
};

const validateEmployees = (employees: any[]): boolean => {
  if (!Array.isArray(employees)) return false;
  return employees.every(emp => 
    emp && 
    typeof emp.id === 'number' && 
    typeof emp.name === 'string'
  );
};

export const saveAppointments = (appointments: any[]) => {
  try {
    if (!validateAppointments(appointments)) {
      console.error('DEBUG - Invalid appointments data, not saving:', appointments);
      return;
    }

    const dataToSave = JSON.stringify(appointments);
    const timestamp = Date.now().toString();
    
    localStorage.setItem('appointments', dataToSave);
    localStorage.setItem('appointmentsTimestamp', timestamp);
    
    console.log('DEBUG - Appuntamenti salvati:', appointments.length);
  } catch (error) {
    console.error('Errore nel salvare appuntamenti:', error);
  }
};

export const loadAppointments = (): any[] => {
  try {
    const stored = localStorage.getItem('appointments');
    const appointments = stored ? JSON.parse(stored) : [];
    
    if (!validateAppointments(appointments)) {
      console.error('DEBUG - Dati appuntamenti corrotti, resettando:', appointments);
      localStorage.removeItem('appointments');
      return [];
    }
    
    console.log('DEBUG - Appuntamenti caricati:', appointments.length);
    return appointments;
  } catch (error) {
    console.error('Errore nel caricamento degli appuntamenti:', error);
    return [];
  }
};

export const saveEmployees = (employees: any[]) => {
  try {
    if (!validateEmployees(employees)) {
      console.error('DEBUG - Invalid employees data, not saving:', employees);
      return;
    }

    const dataToSave = JSON.stringify(employees);
    const timestamp = Date.now().toString();
    
    localStorage.setItem('employees', dataToSave);
    localStorage.setItem('employeesTimestamp', timestamp);
    
    console.log('DEBUG - Dipendenti salvati:', employees.length);
  } catch (error) {
    console.error('Errore nel salvare dipendenti:', error);
  }
};

export const loadEmployees = (): any[] => {
  try {
    const stored = localStorage.getItem('employees');
    const employees = stored ? JSON.parse(stored) : [];
    
    if (!validateEmployees(employees)) {
      console.error('DEBUG - Dati dipendenti corrotti, resettando:', employees);
      localStorage.removeItem('employees');
      return [];
    }
    
    console.log('DEBUG - Dipendenti caricati:', employees.length);
    return employees;
  } catch (error) {
    console.error('Errore nel caricamento dei dipendenti:', error);
    return [];
  }
};

// Basic sync function
export const syncData = () => {
  console.log('DEBUG - Forzando sincronizzazione dati...');
  
  // Force reload events
  window.dispatchEvent(new Event('storage'));
};

// Clear all stored data
export const clearAllData = () => {
  console.log('DEBUG - Clearing all stored data...');
  
  const keysToRemove = [
    'appointments',
    'appointmentsTimestamp',
    'employees',
    'employeesTimestamp'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Force sync after clearing
  syncData();
};
