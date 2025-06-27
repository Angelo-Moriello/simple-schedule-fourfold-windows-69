
// Browser compatibility utilities
export const isBrowserSupported = (): boolean => {
  try {
    return typeof localStorage !== 'undefined' && 
           typeof setInterval !== 'undefined' && 
           typeof clearInterval !== 'undefined';
  } catch (error) {
    console.error('Browser compatibility check failed:', error);
    return false;
  }
};

export const safeLocalStorageGet = (key: string, fallback: string = '[]'): string => {
  try {
    if (!isBrowserSupported()) return fallback;
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    console.error(`Error accessing localStorage for key ${key}:`, error);
    return fallback;
  }
};

export const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    if (!isBrowserSupported()) return false;
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting localStorage for key ${key}:`, error);
    return false;
  }
};
