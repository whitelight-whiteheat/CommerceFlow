import React, { useState } from 'react';
import { clearAllTokens, getTokenInfo, checkTokenValidity, forceFreshLogin, debugLocalStorage } from '../utils/tokenUtils';

const TokenDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const runDebug = async () => {
    const info: string[] = [];
    
    info.push('=== JWT Token Debugger ===\n');
    
    // Check localStorage
    info.push('1. localStorage Contents:');
    debugLocalStorage();
    info.push('   (Check browser console for details)\n');
    
    // Get token info
    info.push('2. Token Information:');
    const tokenInfo = getTokenInfo();
    if (tokenInfo) {
      info.push('   ✅ Token found and decoded');
    } else {
      info.push('   ❌ No valid token found');
    }
    info.push('   (Check browser console for details)\n');
    
    // Check token validity
    info.push('3. Token Validity Check:');
    try {
      const isValid = await checkTokenValidity();
      info.push(`   ${isValid ? '✅' : '❌'} Token is ${isValid ? 'valid' : 'invalid'}`);
    } catch (error) {
      info.push(`   ❌ Error checking validity: ${error}`);
    }
    info.push('   (Check browser console for details)\n');
    
    // Environment info
    info.push('4. Environment Information:');
    info.push(`   API URL: ${process.env.REACT_APP_API_URL || 'Default'}`);
    info.push(`   Current URL: ${window.location.href}`);
    info.push(`   User Agent: ${navigator.userAgent.substring(0, 50)}...\n');
    
    setDebugInfo(info.join('\n'));
  };

  const handleClearTokens = () => {
    clearAllTokens();
    setDebugInfo('✅ Tokens cleared! Please refresh the page.');
  };

  const handleForceLogin = () => {
    forceFreshLogin();
  };

  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setIsVisible(true)}
          style={{
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
          title="Debug JWT Token Issues"
        >
          🔧
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '80vh',
      background: 'white',
      border: '2px solid #ff6b6b',
      borderRadius: '10px',
      padding: '20px',
      zIndex: 1001,
      overflow: 'auto',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#ff6b6b' }}>🔧 JWT Token Debugger</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={runDebug}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Run Debug
        </button>
        
        <button
          onClick={handleClearTokens}
          style={{
            background: '#ff9800',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Clear Tokens
        </button>
        
        <button
          onClick={handleForceLogin}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Force Login
        </button>
      </div>
      
      {debugInfo && (
        <div style={{
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {debugInfo}
        </div>
      )}
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Click "Run Debug" to check token status</li>
          <li>Check browser console for detailed logs</li>
          <li>If token is invalid, click "Clear Tokens" then "Force Login"</li>
          <li>Login again to get a fresh token</li>
        </ol>
      </div>
    </div>
  );
};

export default TokenDebugger; 