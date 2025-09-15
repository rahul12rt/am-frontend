// lib/api-clients.ts
import axios, { 
  AxiosInstance,  
  AxiosResponse, 
  AxiosError, 
  InternalAxiosRequestConfig 
} from 'axios';
import { createClient } from './supabase';

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

// No need for custom token management - Supabase handles this

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
  async (config: InternalAxiosRequestConfig) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      logRequest(config);
      return config;
    } catch (error) {
      console.error('Error fetching Supabase session:', error);
      return Promise.reject(error);
    }
  },
  (error: AxiosError) => {
    console.error('Protected API request error:', error);
    return Promise.reject(error);
  }
);


  // Response interceptor for protected routes
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      logResponse(response);
      return response;
    },
    async (error: AxiosError) => {
      logError(error);

      // On 401, let Supabase handle token refresh automatically
      // The middleware will handle session refreshing
      if (error.response?.status === 401) {
        console.warn('Unauthorized request - session may have expired');
      }

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