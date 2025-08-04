// lib/api-clients.ts
import axios, { 
  AxiosInstance,  
  AxiosResponse, 
  AxiosError, 
  InternalAxiosRequestConfig 
} from 'axios';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
  token: string;
  refreshToken?: string;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

// Token management utilities
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },
  
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },
  
  setRefreshToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },
  
  clearTokens: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getToken();
  }
};

// Base configuration for all API clients
const baseConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Common request logging
const logRequest = (config: InternalAxiosRequestConfig) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
    });
  }
};

// Common response logging
const logResponse = (response: AxiosResponse) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
  }
};

// Common error logging
const logError = (error: AxiosError) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
  }
};

// =================
// UNPROTECTED API CLIENT
// =================
const createUnprotectedApiClient = (): AxiosInstance => {
  const client = axios.create(baseConfig);

  // Request interceptor for unprotected routes
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      logRequest(config);
      return config;
    },
    (error: AxiosError) => {
      console.error('Unprotected API request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for unprotected routes
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      logResponse(response);
      return response;
    },
    (error: AxiosError) => {
      logError(error);
      return Promise.reject(error);
    }
  );

  return client;
};

// =================
// PROTECTED API CLIENT
// =================
const createProtectedApiClient = (): AxiosInstance => {
  const client = axios.create(baseConfig);

  // Request interceptor for protected routes
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenManager.getToken();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      logRequest(config);
      return config;
    },
    (error: AxiosError) => {
      console.error('Protected API request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for protected routes with token refresh logic
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      logResponse(response);
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      // Handle 401 Unauthorized errors with token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const refreshToken = tokenManager.getRefreshToken();
        
        if (refreshToken) {
          try {
            // Attempt to refresh the token using unprotected client
            const refreshResponse = await unprotectedApiClient.post('/auth/refresh', { 
              refreshToken 
            });
            
            const { token: newToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
            tokenManager.setToken(newToken);
            
            if (newRefreshToken) {
              tokenManager.setRefreshToken(newRefreshToken);
            }
            
            // Retry the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            
            return client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            tokenManager.clearTokens();
            
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token, clear tokens and redirect to login
          tokenManager.clearTokens();
          
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
      
      logError(error);
      return Promise.reject(error);
    }
  );

  return client;
};

// Create client instances
export const unprotectedApiClient = createUnprotectedApiClient();
export const protectedApiClient = createProtectedApiClient();

// Error handling utility
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data && typeof error.response.data === 'object') {
    const errorData = error.response.data as any;
    return errorData.message || errorData.error || 'An unexpected error occurred';
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Network error occurred';
};

// Export both clients as default for backward compatibility
export default {
  unprotected: unprotectedApiClient,
  protected: protectedApiClient,
};