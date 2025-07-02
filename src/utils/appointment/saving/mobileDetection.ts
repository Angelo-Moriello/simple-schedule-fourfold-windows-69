
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
  
  // Tempi drasticamente aumentati per mobile per garantire affidabilità
  const delays = {
    saveDelay: isMobile ? 1200 : 400, // Tempo base tra salvataggi
    retryDelay: (attempt: number) => isMobile ? attempt * 2000 : attempt * 800, // Tempo tra retry
    additionalDelay: isMobile ? 2000 : 800, // Tempo tra appuntamenti aggiuntivi
    recurringDelay: isMobile ? 2500 : 1000, // Tempo tra appuntamenti ricorrenti (più critico)
    connectionType
  };
  
  console.log('📱 DELAYS CONFIGURATI:', {
    isMobile,
    connectionType,
    delays
  });
  
  return delays;
};
