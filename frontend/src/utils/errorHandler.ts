import axios, { AxiosError } from 'axios';

// Error types
export interface ApiError {
  message: string;
  statusCode?: number;
  timestamp?: string;
}

// Custom error class for API errors
export class ApiErrorHandler extends Error {
  public statusCode?: number;
  public timestamp?: string;

  constructor(message: string, statusCode?: number, timestamp?: string) {
    super(message);
    this.name = 'ApiErrorHandler';
    this.statusCode = statusCode;
    this.timestamp = timestamp;
  }
}

// Centralized error handler for API calls
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    
    // Network error
    if (!axiosError.response) {
      return {
        message: 'Network error. Please check your internet connection.',
        statusCode: 0
      };
    }

    // Server error with response
    const { status, data } = axiosError.response;
    const errorMessage = data?.message || axiosError.message || 'An unexpected error occurred';
    
    return {
      message: errorMessage,
      statusCode: status,
      timestamp: data?.timestamp
    };
  }

  // Non-Axios error
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500
    };
  }

  // Unknown error
  return {
    message: 'An unexpected error occurred',
    statusCode: 500
  };
};

// Enhanced axios instance with error handling
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const apiError = handleApiError(error);
    console.error('API Response Error:', apiError);
    
    // You can add global error handling here
    // Example: show toast notification, redirect to error page, etc.
    
    return Promise.reject(new ApiErrorHandler(apiError.message, apiError.statusCode, apiError.timestamp));
  }
);

// Utility function to show user-friendly error messages
export const getErrorMessage = (error: unknown): string => {
  const apiError = handleApiError(error);
  
  // Map common error codes to user-friendly messages
  switch (apiError.statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'Access denied. You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This resource already exists.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return apiError.message;
  }
};

// Utility function to check if error is retryable
export const isRetryableError = (error: unknown): boolean => {
  const apiError = handleApiError(error);
  
  // Retry on network errors and 5xx server errors
  return apiError.statusCode === 0 || (apiError.statusCode !== undefined && apiError.statusCode >= 500);
};

// Utility function to format error for display
export const formatErrorForDisplay = (error: unknown): string => {
  const message = getErrorMessage(error);
  
  // Add timestamp if available
  if (axios.isAxiosError(error) && error.response?.data?.timestamp) {
    return `${message} (Error occurred at ${new Date(error.response.data.timestamp).toLocaleString()})`;
  }
  
  return message;
}; 