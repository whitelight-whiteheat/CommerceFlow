// Token utility functions for debugging and management

export const clearAllTokens = () => {
  console.log('🧹 Clearing all authentication tokens...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('✅ All tokens cleared from localStorage');
};

export const getTokenInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ No token found in localStorage');
    return null;
  }
  
  console.log('🔍 Token Information:');
  console.log('   Length:', token.length);
  console.log('   Preview:', token.substring(0, 20) + '...');
  console.log('   Full token:', token);
  
  // Try to decode the token (without verification)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('   Decoded payload:', payload);
    console.log('   Expires at:', new Date(payload.exp * 1000).toISOString());
    console.log('   Issued at:', new Date(payload.iat * 1000).toISOString());
    return payload;
  } catch (error) {
    console.log('   Could not decode token payload:', error);
    return null;
  }
};

export const checkTokenValidity = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ No token to validate');
    return false;
  }
  
  try {
    // Try to make a request to validate the token
    const response = await fetch('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Token is valid');
      return true;
    } else {
      console.log('❌ Token is invalid:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Error validating token:', error);
    return false;
  }
};

// Function to force a fresh login by clearing tokens
export const forceFreshLogin = () => {
  console.log('🔄 Forcing fresh login...');
  clearAllTokens();
  
  // Redirect to login page
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

// Debug function to log all localStorage items
export const debugLocalStorage = () => {
  console.log('🔍 localStorage contents:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`   ${key}:`, value);
  }
}; 