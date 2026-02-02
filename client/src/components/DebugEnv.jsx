// Temporary debug component - remove after testing
const DebugEnv = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '15px',
      background: '#1a1a1a',
      border: '2px solid #00ff88',
      borderRadius: '8px',
      color: 'white',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <div><strong>Gemini API Key Status:</strong></div>
      <div style={{ marginTop: '8px' }}>
        {apiKey ? (
          <>
            <span style={{ color: '#00ff88' }}>✓ Configured</span>
            <div style={{ marginTop: '4px', color: '#888' }}>
              Key: {apiKey.substring(0, 15)}...
            </div>
          </>
        ) : (
          <span style={{ color: '#ff4444' }}>✗ Not found</span>
        )}
      </div>
      <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
        All VITE_ vars: {Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')).length}
      </div>
    </div>
  );
};

export default DebugEnv;
