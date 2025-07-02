
export const isMobileDevice = (): boolean => {
  return /Mobi|Android/i.test(navigator.userAgent);
};

export const getConnectionType = (): string => {
  try {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || 'unknown';
  } catch {
    return 'unknown';
  }
};

export const getMobileDelays = () => {
  const isMobile = isMobileDevice();
  const connectionType = getConnectionType();
  
  // Tempi aumentati significativamente per mobile
  return {
    saveDelay: isMobile ? 800 : 300, // Aumentato da 300 a 800 per mobile
    retryDelay: (attempt: number) => isMobile ? attempt * 1500 : attempt * 700, // Aumentato
    additionalDelay: isMobile ? 1500 : 600, // Aumentato da 1000 a 1500 per mobile
    recurringDelay: isMobile ? 2000 : 800, // Aumentato da 1200 a 2000 per mobile
    connectionType
  };
};
