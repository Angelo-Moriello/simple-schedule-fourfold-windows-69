
// Utility per gestire la persistenza dei dati tra diverse istanze dell'app
// con supporto migliorato per dispositivi mobili

// Mobile detection helper
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Network status helper
const isOnline = () => {
  return navigator.onLine;
};

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
    
    // On mobile, also save to sessionStorage as backup
    if (isMobile()) {
      sessionStorage.setItem('appointments_backup', dataToSave);
      sessionStorage.setItem('appointmentsTimestamp_backup', timestamp);
      
      // Also save to IndexedDB for better mobile persistence
      try {
        const request = indexedDB.open('AppointmentDB', 1);
        request.onsuccess = () => {
          const db = request.result;
          if (db.objectStoreNames.contains('appointments')) {
            const transaction = db.transaction(['appointments'], 'readwrite');
            const store = transaction.objectStore('appointments');
            store.put({ id: 'current', data: appointments, timestamp: Date.now() });
          }
        };
      } catch (idbError) {
        console.warn('IndexedDB not available:', idbError);
      }
    }
    
    console.log('DEBUG - Appuntamenti salvati:', appointments.length, 'Mobile:', isMobile());
  } catch (error) {
    console.error('Errore nel salvare appuntamenti:', error);
  }
};

export const loadAppointments = (): any[] => {
  try {
    let stored = localStorage.getItem('appointments');
    
    // On mobile, check multiple sources
    if (isMobile()) {
      console.log('DEBUG - Caricamento mobile, verificando fonti multiple...');
      
      // Check localStorage first
      if (!stored || stored === '[]' || stored === 'null') {
        console.log('DEBUG - localStorage vuoto, tentativo sessionStorage...');
        stored = sessionStorage.getItem('appointments_backup');
      }
      
      // If still empty, try IndexedDB
      if (!stored || stored === '[]' || stored === 'null') {
        console.log('DEBUG - Anche sessionStorage vuoto, dati non disponibili offline');
        // IndexedDB is async, so we can't wait for it here
        // Instead, we'll return empty array and let the app sync from server
        return [];
      }
    }
    
    const appointments = stored ? JSON.parse(stored) : [];
    
    if (!validateAppointments(appointments)) {
      console.error('DEBUG - Dati appuntamenti corrotti, resettando:', appointments);
      localStorage.removeItem('appointments');
      sessionStorage.removeItem('appointments_backup');
      return [];
    }
    
    console.log('DEBUG - Appuntamenti caricati:', appointments.length, 'Mobile:', isMobile());
    return appointments;
  } catch (error) {
    console.error('Errore nel caricamento degli appuntamenti:', error);
    
    // Try backup on mobile
    if (isMobile()) {
      try {
        const backup = sessionStorage.getItem('appointments_backup');
        const backupData = backup ? JSON.parse(backup) : [];
        if (validateAppointments(backupData)) {
          return backupData;
        }
      } catch (backupError) {
        console.error('Errore nel caricamento backup:', backupError);
      }
    }
    
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
    
    // On mobile, also save to sessionStorage as backup
    if (isMobile()) {
      sessionStorage.setItem('employees_backup', dataToSave);
      sessionStorage.setItem('employeesTimestamp_backup', timestamp);
      
      // Also save to IndexedDB for better mobile persistence
      try {
        const request = indexedDB.open('AppointmentDB', 1);
        request.onsuccess = () => {
          const db = request.result;
          if (db.objectStoreNames.contains('employees')) {
            const transaction = db.transaction(['employees'], 'readwrite');
            const store = transaction.objectStore('employees');
            store.put({ id: 'current', data: employees, timestamp: Date.now() });
          }
        };
      } catch (idbError) {
        console.warn('IndexedDB not available:', idbError);
      }
    }
    
    console.log('DEBUG - Dipendenti salvati:', employees.length, 'Mobile:', isMobile());
  } catch (error) {
    console.error('Errore nel salvare dipendenti:', error);
  }
};

export const loadEmployees = (): any[] => {
  try {
    let stored = localStorage.getItem('employees');
    
    // On mobile, check multiple sources
    if (isMobile()) {
      console.log('DEBUG - Caricamento mobile dipendenti, verificando fonti multiple...');
      
      // Check localStorage first
      if (!stored || stored === '[]' || stored === 'null') {
        console.log('DEBUG - localStorage dipendenti vuoto, tentativo sessionStorage...');
        stored = sessionStorage.getItem('employees_backup');
      }
      
      // If still empty, we'll return empty and let server sync
      if (!stored || stored === '[]' || stored === 'null') {
        console.log('DEBUG - Anche sessionStorage dipendenti vuoto, forzando sync da server');
        return [];
      }
    }
    
    const employees = stored ? JSON.parse(stored) : [];
    
    if (!validateEmployees(employees)) {
      console.error('DEBUG - Dati dipendenti corrotti, resettando:', employees);
      localStorage.removeItem('employees');
      sessionStorage.removeItem('employees_backup');
      return [];
    }
    
    console.log('DEBUG - Dipendenti caricati:', employees.length, 'Mobile:', isMobile());
    return employees;
  } catch (error) {
    console.error('Errore nel caricamento dei dipendenti:', error);
    
    // Try backup on mobile
    if (isMobile()) {
      try {
        const backup = sessionStorage.getItem('employees_backup');
        const backupData = backup ? JSON.parse(backup) : [];
        if (validateEmployees(backupData)) {
          return backupData;
        }
      } catch (backupError) {
        console.error('Errore nel caricamento backup dipendenti:', backupError);
      }
    }
    
    return [];
  }
};

// Enhanced sync function for mobile
export const syncData = () => {
  console.log('DEBUG - Forzando sincronizzazione dati...', 'Mobile:', isMobile(), 'Online:', isOnline());
  
  // Clear any stale or corrupted data on mobile
  if (isMobile()) {
    try {
      const appointmentsTimestamp = parseInt(localStorage.getItem('appointmentsTimestamp') || '0');
      const employeesTimestamp = parseInt(localStorage.getItem('employeesTimestamp') || '0');
      const now = Date.now();
      
      // If data is older than 2 minutes on mobile, clear it to force fresh load
      if (now - appointmentsTimestamp > 120000) {
        console.log('DEBUG - Clearing stale appointments data on mobile');
        localStorage.removeItem('appointments');
        localStorage.removeItem('appointmentsTimestamp');
        sessionStorage.removeItem('appointments_backup');
        sessionStorage.removeItem('appointmentsTimestamp_backup');
      }
      
      if (now - employeesTimestamp > 120000) {
        console.log('DEBUG - Clearing stale employees data on mobile');
        localStorage.removeItem('employees');
        localStorage.removeItem('employeesTimestamp');
        sessionStorage.removeItem('employees_backup');
        sessionStorage.removeItem('employeesTimestamp_backup');
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
    window.dispatchEvent(new CustomEvent('mobile-data-refresh', { detail: { forced: true } }));
  }
};

// Clear all stored data (useful for troubleshooting)
export const clearAllData = () => {
  console.log('DEBUG - Clearing all stored data...', 'Mobile:', isMobile());
  
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
  
  // Clear IndexedDB on mobile
  if (isMobile()) {
    try {
      const deleteRequest = indexedDB.deleteDatabase('AppointmentDB');
      deleteRequest.onsuccess = () => {
        console.log('DEBUG - IndexedDB cleared');
      };
    } catch (error) {
      console.log('DEBUG - IndexedDB clear error (normal if not supported):', error);
    }
  }
  
  // Force sync after clearing
  syncData();
};

// Initialize IndexedDB on mobile for better persistence
if (isMobile()) {
  try {
    const request = indexedDB.open('AppointmentDB', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('appointments')) {
        db.createObjectStore('appointments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('employees')) {
        db.createObjectStore('employees', { keyPath: 'id' });
      }
    };
  } catch (error) {
    console.log('DEBUG - IndexedDB initialization skipped (not supported):', error);
  }
}
