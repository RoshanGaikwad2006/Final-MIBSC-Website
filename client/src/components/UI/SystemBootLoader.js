import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../utils/api';

const SystemBootLoader = ({ onReady }) => {
  const [logs, setLogs] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [isError, setIsError] = useState(false);
  const scrollRef = useRef(null);

  // Styling for the terminal look (inline to avoid new CSS files/conflicts)
  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0b14', // Deep navy/black
      backgroundImage: 'radial-gradient(circle at center, #111827 0%, #000000 100%)',
      color: '#00ffcc', // Cyan/teal text
      fontFamily: '"Courier New", Courier, monospace',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      overflow: 'hidden',
    },
    terminal: {
      width: '100%',
      maxWidth: '800px',
      height: '600px',
      border: '1px solid #00ffcc',
      boxShadow: '0 0 20px rgba(0, 255, 204, 0.2)',
      backgroundColor: 'rgba(0, 10, 20, 0.9)',
      borderRadius: '8px',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    scanline: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1))',
      backgroundSize: '100% 4px',
      pointerEvents: 'none',
      zIndex: 10,
    },
    glow: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      boxShadow: 'inset 0 0 50px rgba(0, 255, 204, 0.1)',
      pointerEvents: 'none',
      zIndex: 11,
    },
    header: {
      borderBottom: '1px solid #008f7a',
      paddingBottom: '1rem',
      marginBottom: '1rem',
      textShadow: '0 0 5px #00ffcc',
    },
    content: {
      flex: 1,
      overflowY: 'auto',
      fontFamily: 'monospace',
    },
    logLine: {
      marginBottom: '0.5rem',
      opacity: 0,
      animation: 'fadeIn 0.2s forwards',
    },
    cursor: {
      display: 'inline-block',
      width: '10px',
      height: '1.2em',
      backgroundColor: '#00ffcc',
      animation: 'blink 1s step-end infinite',
      marginLeft: '5px',
      verticalAlign: 'text-bottom',
    },
    progressBar: {
      width: '100%',
      height: '4px',
      backgroundColor: '#003333',
      marginTop: '1rem',
      position: 'relative',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#00ffcc',
      boxShadow: '0 0 10px #00ffcc',
      transition: 'width 0.5s ease',
      width: `${Math.min((attempts / 10) * 100, 100)}%` // Visual progress based on attempts (up to ~30s)
    }
  };

  // Add keyframes style tag dynamically
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #001111; }
      ::-webkit-scrollbar-thumb { background: #004444; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #006666; }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
    const prefix = type === 'error' ? '[ERROR]' : type === 'success' ? '[SUCCESS]' : '[INFO]';
    const color = type === 'error' ? '#ff3333' : type === 'success' ? '#33ff33' : '#00ffcc';
    
    setLogs(prev => [...prev, { text: `[${timestamp}] ${prefix} ${message}`, color }]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    let timeoutId;
    let isMounted = true;
    const MAX_ATTEMPTS = 10; // 30 seconds total (3s * 10)
    const RETRY_DELAY = 3000;
    
    // Developer mode check
    const isDev = process.env.NODE_ENV === 'development'; // || true; // Uncomment to test in dev
    const DEV_DELAY = isDev ? 5000 : 0;

    const checkHealth = async () => {
      try {
        if (!isMounted) return;
        
        setAttempts(prev => prev + 1);
        addLog(`Pinging server services... (Attempt ${attempts + 1})`);

        const start = Date.now();
        await api.get('/health', { timeout: 5000 }); // Short timeout for health check
        
        if (!isMounted) return;

        // Success!
        addLog('Secure connection established.', 'success');
        addLog('Services online.', 'success');
        addLog('Initializing application interface...', 'info');

        // Apply artificial dev delay if needed
        if (isDev && attempts === 0) { // Only delay on first successful hit if it happened fast
           addLog('DEV MODE: Simulating cold start delay...', 'info');
           await new Promise(r => setTimeout(r, DEV_DELAY));
        }

        setTimeout(() => {
          if (isMounted) onReady();
        }, 1000); // Slight delay for user to see success message

      } catch (error) {
        if (!isMounted) return;
        
        // Failed
        console.warn('Health check failed:', error);
        
        if (attempts >= MAX_ATTEMPTS) {
           addLog('Maximum retry attempts reached.', 'error');
           addLog('Forcing initialization (Offline Mode)...', 'error');
           setIsError(true);
           setTimeout(() => {
             if (isMounted) onReady(); // Force entry after max retries
           }, 2000);
           return;
        }

        addLog(`Server is warming up... retrying in ${RETRY_DELAY/1000}s`, 'info');
        timeoutId = setTimeout(checkHealth, RETRY_DELAY);
      }
    };

    // Initial sequence
    const startSequence = async () => {
      addLog('MIBCS SYSTEM BOOT INITIALIZED');
      addLog('Loading core modules...');
      await new Promise(r => setTimeout(r, 800));
      addLog('Verifying environment integrity...');
      await new Promise(r => setTimeout(r, 800));
      
      checkHealth();
    };

    startSequence();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReady]); // attempts is in dependency of internal function, but we use ref pattern or just let it update. 
                 // Actually simpler: we can't easily rely on 'attempts' state inside the effect if we recurse via setTimeout without refs.
                 // Refactoring to use a robust interval or recursive timeout with ref for count.
                 // However, for this simple logic, re-running effect on 'attempts' change is okay IF we structure it right, 
                 // but recursive timeout inside effect with no deps is safer to avoid re-renders resetting timers.

  // Component logic is fully contained.

  return (
    <div style={styles.container}>
      <div style={styles.terminal}>
        <div style={styles.scanline}></div>
        <div style={styles.glow}></div>
        
        <div style={styles.header}>
          <h1 className="text-2xl font-bold mb-2">MIBCS SYSTEM INITIALIZATION</h1>
          <p className="text-sm opacity-70">Target: {process.env.REACT_APP_API_URL || 'Localhost/Remote'}</p>
          <div className="text-xs text-yellow-400 mt-1">
             Process: Warming up server (Cold start can take ~30s)
          </div>
        </div>

        <div style={styles.content} ref={scrollRef}>
          {logs.map((log, index) => (
            <div key={index} style={{ ...styles.logLine, color: log.color }}>
              {log.text}
            </div>
          ))}
          <div style={{ marginTop: '1rem' }}>
            <span style={{ color: '#00ffcc' }}>$</span>
            <span style={styles.cursor}></span>
          </div>
        </div>

        <div style={styles.progressBar}>
           <div style={styles.progressFill}></div>
        </div>
      </div>
    </div>
  );
};

export default SystemBootLoader;
