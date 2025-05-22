import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AuthDebug() {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    isValid: false,
    error: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        setAuthState(prev => ({
          ...prev,
          token: token ? `${token.substring(0, 10)}...` : null,
          user
        }));
        
        if (!token) {
          throw new Error('No token found');
        }
        
        // Update the URL to use the deployed backend
        const response = await axios.get('https://wealthmap-server.onrender.com/api/auth/user', {
          headers: { 'x-auth-token': token }
        });
        
        setAuthState(prev => ({
          ...prev,
          isValid: true,
          serverResponse: response.data
        }));
      } catch (error) {
        console.error('Auth debug error:', error);
        setAuthState(prev => ({
          ...prev,
          isValid: false,
          error: error.message || 'Authentication failed'
        }));
      }
    };
    
    checkAuth();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px',
      background: '#f0f0f0',
      padding: '10px',
      borderRadius: '5px',
      maxWidth: '300px',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}>
      <h4>Auth Debug</h4>
      <p><strong>Token:</strong> {authState.token || 'None'}</p>
      <p><strong>User:</strong> {authState.user ? JSON.stringify(authState.user, null, 2) : 'None'}</p>
      <p><strong>Valid:</strong> {authState.isValid ? '✅' : '❌'}</p>
      {authState.error && <p><strong>Error:</strong> {authState.error}</p>}
      <button onClick={() => localStorage.clear() || window.location.reload()}>
        Clear Storage & Reload
      </button>
    </div>
  );
}

export default AuthDebug;
