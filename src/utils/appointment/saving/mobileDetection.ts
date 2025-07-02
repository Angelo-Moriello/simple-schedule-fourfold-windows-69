
export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // Controlli multipli per garantire il rilevamento corretto
  const userAgent = navigator.userAgent.toLowerCase();
  console.log('🔍 USER AGENT COMPLETO:', navigator.userAgent);
  
  // Lista estesa di pattern mobile
  const mobilePatterns = [
    /android/i,
    /webos/i,
    /iphone/i,
    /ipad/i,
    /ipod/i,
    /blackberry/i,
    /windows phone/i,
    /mobile/i,
    /tablet/i,
    /kindle/i,
    /silk/i,
    /opera mini/i,
    /opera mobi/i
  ];
  
  const isMobileUA = mobilePatterns.some(pattern => pattern.test(navigator.userAgent));
  
  // Controlli aggiuntivi più affidabili
  const hasTouchScreen = 'ontouchstart' in window || 
                        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
                        (navigator as any).msMaxTouchPoints > 0;
  
  const isSmallScreen = window.innerWidth <= 768;
  const hasSmallViewport = window.screen.width <= 768 || window.screen.availWidth <= 768;
  
  // Se anche uno solo di questi è vero, consideriamo mobile
  const isMobileByUA = isMobileUA;
  const isMobileByTouch = hasTouchScreen && isSmallScreen;
  const isMobileByScreen = hasSmallViewport;
  
  // FORZA MOBILE se siamo in dubbio (più sicuro per il salvataggio)
  const finalResult = isMobileByUA || isMobileByTouch || isMobileByScreen;
  
  console.log('📱 RILEVAMENTO MOBILE DETTAGLIATO V2:', {
    userAgent: navigator.userAgent,
    checks: {
      mobileUA: isMobileByUA,
      touchAndSmall: isMobileByTouch,
      smallScreen: isMobileByScreen
    },
    metrics: {
      windowWidth: window.innerWidth,
      screenWidth: window.screen.width,
      availWidth: window.screen.availWidth,
      maxTouchPoints: navigator.maxTouchPoints,
      hasTouchStart: 'ontouchstart' in window
    },
    finalResult,
    willUseMobileDelays: finalResult
  });
  
  return finalResult;
};

export const getConnectionType = (): string => {
  try {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
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
  
  // DELAY MOLTO PIÙ AGGRESSIVI per garantire funzionamento mobile
  const delays = {
    // Delay base aumentati significativamente
    saveDelay: isMobile ? 3000 : 500,        // 3 secondi mobile vs 0.5 desktop
    retryDelay: (attempt: number) => isMobile ? attempt * 4000 : attempt * 800, // 4s mobile vs 0.8s desktop
    additionalDelay: isMobile ? 4000 : 800,   // 4 secondi tra appuntamenti aggiuntivi
    recurringDelay: isMobile ? 6000 : 1000,   // 6 secondi tra ricorrenti mobile!
    connectionType,
    isMobile
  };
  
  console.log('📱 MOBILE DELAYS V2 - AGGRESSIVI PER STABILITÀ:', {
    rilevamento: {
      isMobile,
      userAgent: navigator.userAgent.substring(0, 100) + '...',
      connectionType
    },
    delays: {
      saveDelay: `${delays.saveDelay}ms`,
      retryExample: `${delays.retryDelay(1)}ms (primo retry)`,
      additionalDelay: `${delays.additionalDelay}ms`,
      recurringDelay: `${delays.recurringDelay}ms`
    },
    confronto: {
      desktop: { saveDelay: '500ms', recurringDelay: '1000ms' },
      mobile: { saveDelay: '3000ms', recurringDelay: '6000ms' },
      modalitàAttiva: isMobile ? '🔴 MOBILE (DELAY LUNGHI)' : '🟢 DESKTOP (DELAY CORTI)'
    },
    tempoTotaleStimato: isMobile ? 'Circa 30-60 secondi per 5 appuntamenti' : 'Circa 5-10 secondi'
  });
  
  return delays;
};
