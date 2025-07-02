
export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // Controlli più approfonditi per dispositivi mobili
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'mobile', 'android', 'iphone', 'ipad', 'ipod', 
    'blackberry', 'windows phone', 'opera mini',
    'iemobile', 'wpdesktop', 'kindle', 'silk',
    'fennec', 'maemo', 'webos'
  ];
  
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // Controllo aggiuntivo basato su touch e dimensioni schermo
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 1024;
  
  const result = isMobileUA || (hasTouchScreen && isSmallScreen);
  
  console.log('🔍 RILEVAMENTO MOBILE DETTAGLIATO:', {
    userAgent: navigator.userAgent,
    userAgentLower: userAgent,
    mobileKeywords: mobileKeywords.filter(k => userAgent.includes(k)),
    isMobileUA,
    hasTouchScreen,
    isSmallScreen,
    windowSize: { width: window.innerWidth, height: window.innerHeight },
    maxTouchPoints: navigator.maxTouchPoints,
    finalResult: result
  });
  
  return result;
};

export const getConnectionType = (): string => {
  try {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      console.log('📶 CONNESSIONE RILEVATA:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      });
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
};

export const getMobileDelays = () => {
  const isMobile = isMobileDevice();
  const connectionType = getConnectionType();
  
  // Delay molto più lunghi per mobile per garantire stabilità
  const delays = {
    saveDelay: isMobile ? 2000 : 300, // 2 secondi per mobile
    retryDelay: (attempt: number) => isMobile ? attempt * 3000 : attempt * 600, // 3 secondi per retry mobile
    additionalDelay: isMobile ? 3000 : 600, // 3 secondi tra appuntamenti aggiuntivi mobile
    recurringDelay: isMobile ? 4000 : 800, // 4 secondi tra appuntamenti ricorrenti mobile
    connectionType,
    isMobile // Aggiungiamo questo per debug
  };
  
  console.log('📱 MOBILE DELAYS CONFIGURATI - DETTAGLIO COMPLETO:', {
    isMobile,
    connectionType,
    userAgent: navigator.userAgent,
    windowSize: { width: window.innerWidth, height: window.innerHeight },
    delays: {
      saveDelay: `${delays.saveDelay}ms`,
      retryDelayExample: `${delays.retryDelay(1)}ms (primo retry)`,
      additionalDelay: `${delays.additionalDelay}ms`,
      recurringDelay: `${delays.recurringDelay}ms`
    },
    confronto: {
      desktop: { saveDelay: '300ms', recurringDelay: '800ms' },
      mobile: { saveDelay: '2000ms', recurringDelay: '4000ms' },
      staUsando: isMobile ? 'MOBILE' : 'DESKTOP'
    }
  });
  
  return delays;
};
