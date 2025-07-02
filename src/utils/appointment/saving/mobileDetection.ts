
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
  return {
    saveDelay: isMobile ? 300 : 150,
    retryDelay: (attempt: number) => isMobile ? attempt * 1000 : attempt * 500,
    additionalDelay: isMobile ? 1000 : 500,
    recurringDelay: isMobile ? 1200 : 600
  };
};
