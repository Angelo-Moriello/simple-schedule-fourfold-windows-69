
// Utility per gestire la persistenza dei dati tra diverse istanze dell'app
// con supporto migliorato per dispositivi mobili

// Mobile detection helper
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const saveAppointments = (appointments: any[]) => {
  try {
    localStorage.setItem('appointments', JSON.stringify(appointments));
    localStorage.setItem('appointmentsTimestamp', Date.now().toString());
    
    // On mobile, also save to sessionStorage as backup
    if (isMobile()) {
      sessionStorage.setItem('appointments_backup', JSON.stringify(appointments));
      sessionStorage.setItem('appointmentsTimestamp_backup', Date.now().toString());
    }
    
    console.log('DEBUG - Appuntamenti salvati:', appointments.length);
  } catch (error) {
    console.error('Errore nel salvare appuntamenti:', error);
  }
};

export const loadAppointments = (): any[] => {
  try {
    let stored = localStorage.getItem('appointments');
    
    // On mobile, check both localStorage and sessionStorage
    if (isMobile() && (!stored || stored === '[]')) {
      console.log('DEBUG - Tentativo di recupero da sessionStorage backup...');
      stored = sessionStorage.getItem('appointments_backup');
    }
    
    const appointments = stored ? JSON.parse(stored) : [];
    console.log('DEBUG - Appuntamenti caricati:', appointments.length);
    return appointments;
  } catch (error) {
    console.error('Errore nel caricamento degli appuntamenti:', error);
    
    // Try backup on mobile
    if (isMobile()) {
      try {
        const backup = sessionStorage.getItem('appointments_backup');
        return backup ? JSON.parse(backup) : [];
      } catch (backupError) {
        console.error('Errore nel caricamento backup:', backupError);
        return [];
      }
    }
    
    return [];
  }
};

export const saveEmployees = (employees: any[]) => {
  try {
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('employeesTimestamp', Date.now().toString());
    
    // On mobile, also save to sessionStorage as backup
    if (isMobile()) {
      sessionStorage.setItem('employees_backup', JSON.stringify(employees));
      sessionStorage.setItem('employeesTimestamp_backup', Date.now().toString());
    }
    
    console.log('DEBUG - Dipendenti salvati:', employees.length);
  } catch (error) {
    console.error('Errore nel salvare dipendenti:', error);
  }
};

export const loadEmployees = (): any[] => {
  try {
    let stored = localStorage.getItem('employees');
    
    // On mobile, check both localStorage and sessionStorage
    if (isMobile() && (!stored || stored === '[]')) {
      console.log('DEBUG - Tentativo di recupero dipendenti da sessionStorage backup...');
      stored = sessionStorage.getItem('employees_backup');
    }
    
    const employees = stored ? JSON.parse(stored) : [];
    console.log('DEBUG - Dipendenti caricati:', employees.length);
    return employees;
  } catch (error) {
    console.error('Errore nel caricamento dei dipendenti:', error);
    
    // Try backup on mobile
    if (isMobile()) {
      try {
        const backup = sessionStorage.getItem('employees_backup');
        return backup ? JSON.parse(backup) : [];
      } catch (backupError) {
        console.error('Errore nel caricamento backup dipendenti:', backupError);
        return [];
      }
    }
    
    return [];
  }
};

// Enhanced sync function for mobile
export const syncData = () => {
  console.log('DEBUG - Forzando sincronizzazione dati...');
  
  // Clear any stale data
  if (isMobile()) {
    try {
      const appointmentsTimestamp = parseInt(localStorage.getItem('appointmentsTimestamp') || '0');
      const employeesTimestamp = parseInt(localStorage.getItem('employeesTimestamp') || '0');
      const now = Date.now();
      
      // If data is older than 5 minutes on mobile, clear it to force fresh load
      if (now - appointmentsTimestamp > 300000) {
        console.log('DEBUG - Clearing stale appointments data on mobile');
        localStorage.removeItem('appointments');
        localStorage.removeItem('appointmentsTimestamp');
      }
      
      if (now - employeesTimestamp > 300000) {
        console.log('DEBUG - Clearing stale employees data on mobile');
        localStorage.removeItem('employees');
        localStorage.removeItem('employeesTimestamp');
      }
    } catch (error) {
      console.error('Errore nella pulizia dati stale:', error);
    }
  }
  
  // Force reload events
  window.dispatchEvent(new Event('storage'));
  
  // Additional mobile-specific events
  if (isMobile()) {
    window.dispatchEvent(new CustomEvent('mobile-sync', { detail: { timestamp: Date.now() } }));
  }
};

// Clear all stored data (useful for troubleshooting)
export const clearAllData = () => {
  console.log('DEBUG - Clearing all stored data...');
  
  const keysToRemove = [
    'appointments',
    'appointmentsTimestamp',
    'employees',
    'employeesTimestamp',
    'appointments_backup',
    'appointmentsTimestamp_backup',
    'employees_backup',
    'employeesTimestamp_backup'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Force sync after clearing
  syncData();
};
