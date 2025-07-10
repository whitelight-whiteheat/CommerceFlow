import axios from 'axios';

// Get API base URL from environment variable with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001/api' 
    : '/api'); // Fallback to relative path for production

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (!config.headers) config.headers = {} as any;
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      console.log('API: 401 Unauthorized - clearing tokens and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Export the base URL for components that need it directly
export { API_BASE_URL }; 