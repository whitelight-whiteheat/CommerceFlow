import axios, { AxiosError } from 'axios';
import { apiClient } from './api';

// Error types for API responses
export interface ApiErrorResponse {
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
export const handleApiError = (error: unknown): ApiErrorResponse => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
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

// Re-export for backward compatibility
export { apiClient };

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

// Error types for better error handling
export class AppError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

// Parse API errors
export const parseApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiErrorResponse;
    return new AppError(
      apiError.message || 'An unexpected error occurred',
      apiError.statusCode,
      undefined
    );
  }

  return new AppError('An unexpected error occurred');
};

// Get user-friendly error messages
export const getErrorMessage = (error: unknown): string => {
  const appError = parseApiError(error);
  
  // Handle specific error codes
  switch (appError.code) {
    case 'UNAUTHORIZED':
      return 'Please log in to continue';
    case 'FORBIDDEN':
      return 'You do not have permission to perform this action';
    case 'NOT_FOUND':
      return 'The requested resource was not found';
    case 'VALIDATION_ERROR':
      return 'Please check your input and try again';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection and try again';
    default:
      return appError.message;
  }
};

// Log errors for debugging (only in development)
export const logError = (error: unknown, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    const appError = parseApiError(error);
    console.error(`[${context || 'App'}] Error:`, {
      message: appError.message,
      status: appError.status,
      code: appError.code,
      stack: appError.stack
    });
  }
};

// Handle async operations with proper error handling
export const handleAsync = async <T>(
  asyncFn: () => Promise<T>,
  context?: string
): Promise<{ data: T | null; error: AppError | null }> => {
  try {
    const data = await asyncFn();
    return { data, error: null };
  } catch (error) {
    const appError = parseApiError(error);
    logError(appError, context);
    return { data: null, error: appError };
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