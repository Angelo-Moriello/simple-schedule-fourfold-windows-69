
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
  
  // Delays più conservativi per mobile per garantire stabilità
  const delays = {
    saveDelay: isMobile ? 1500 : 300, // Tempo base tra salvataggi (aumentato)
    retryDelay: (attempt: number) => isMobile ? attempt * 2500 : attempt * 600, // Tempo tra retry (aumentato)
    additionalDelay: isMobile ? 2500 : 600, // Tempo tra appuntamenti aggiuntivi (aumentato)
    recurringDelay: isMobile ? 3000 : 800, // Tempo tra appuntamenti ricorrenti (aumentato)
    connectionType
  };
  
  console.log('📱 MOBILE DELAYS CONFIGURATI:', {
    isMobile,
    connectionType,
    delays: {
      saveDelay: `${delays.saveDelay}ms`,
      retryDelayExample: `${delays.retryDelay(1)}ms (primo retry)`,
      additionalDelay: `${delays.additionalDelay}ms`,
      recurringDelay: `${delays.recurringDelay}ms`
    }
  });
  
  return delays;
};
