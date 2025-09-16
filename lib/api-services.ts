/**
 * Standardized API Services Layer
 * 
 * This file contains pure API service functions separated from hook logic.
 * These functions handle the actual HTTP requests and data transformation.
 * 
 * Benefits:
 * - Reusable across different components
 * - Testable in isolation
 * - Follows separation of concerns
 * - Type-safe with proper error handling
 */

import { protectedApiClient, unprotectedApiClient, handleApiError } from './api-clients';
import { AxiosError } from 'axios';
import { UserProfile, Address } from '../types/user';

// =================
// SHARED TYPES
// =================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =================
// WATCH TYPES
// =================

export interface WatchImage {
  id: string;
  isoview: string;
  front: string;
  back: string;
  side: string;
  strap?: string;
  closeup?: string;
  dial?: string;
}

export interface Watch {
  id: string;
  name: string;
  description: string | { [key: string]: any };
  characteristics: { [key: string]: any };
  actualprice: number;
  offerprice: number;
  offerpercentage: number;
  rating?: number;
  reviewscount?: number;
  category: string;
  series: string;
  modelgroup: string;
  releasedate: string;
  theme: string;
  warrantyperiod: string;
  stockavailability: string;
  isfeatured: boolean;
  createdAt: string;
  updatedAt: string;
  WatchImages: WatchImage[];
  WatchColors: WatchColor[];
  reviews?: Review[];
}

export interface WatchFilters extends PaginationParams, SortParams {
  category?: string;
  series?: string;
  modelgroup?: string;
  theme?: string;
  minPrice?: number;
  maxPrice?: number;
  isfeatured?: boolean;
  search?: string;
}

export interface WatchFormData {
  name: string;
  description: string;
  characteristics: string;
  actualprice: number;
  offerprice: number;
  offerpercentage: number;
  category: string;
  series: string;
  modelgroup: string;
  releasedate: string;
  theme: string;
  warrantyperiod: string;
  stockavailability: string;
  isfeatured: boolean;
}

export interface WatchImageFiles {
  isoview?: File;
  front?: File;
  back?: File;
  side?: File;
  strap?: File;
  closeup?: File;
  dial?: File;
}

export interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
}

// =================
// WATCH SERVICES
// =================

export const watchServices = {
  /**
   * Get all watches with optional filters
   */
  getWatches: async (filters?: WatchFilters): Promise<Watch[]> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = `/watches${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await unprotectedApiClient.get<Watch[]>(url);
    
    return response.data;
  },

  /**
   * Get a single watch by ID
   */
  getWatchById: async (id: string): Promise<Watch> => {
    const response = await unprotectedApiClient.get<ApiResponse<Watch>>(`/watches/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch watch details');
    }
    
    return response.data.data;
  },

  /**
   * Get featured watches
   */
  getFeaturedWatches: async (limit?: number): Promise<Watch[]> => {
    const params = new URLSearchParams();
    params.append('isfeatured', 'true');
    if (limit) params.append('limit', limit.toString());

    const response = await unprotectedApiClient.get<ApiResponse<Watch[]>>(`/watches?${params.toString()}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch featured watches');
    }
    
    return response.data.data;
  },

  /**
   * Search watches by query
   */
  searchWatches: async (query: string, filters?: Omit<WatchFilters, 'search'>): Promise<Watch[]> => {
    const params = new URLSearchParams();
    params.append('search', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await unprotectedApiClient.get<ApiResponse<Watch[]>>(`/watches?${params.toString()}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to search watches');
    }
    
    return response.data.data;
  },

  /**
   * Create a new watch (admin only)
   */
  createWatch: async (formData: WatchFormData, images: WatchImageFiles): Promise<Watch> => {
    const formPayload = new FormData();
    
    // Append form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formPayload.append(key, value.toString());
      }
    });
    
    // Append image files
    Object.entries(images).forEach(([key, file]) => {
      if (file && file instanceof File) {
        formPayload.append(key, file);
      }
    });

    const response = await protectedApiClient.post<ApiResponse<Watch>>('/watches', formPayload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for file upload
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create watch');
    }

    return response.data.data;
  },

  /**
   * Update an existing watch (admin only)
   */
  updateWatch: async (id: string, formData: Partial<WatchFormData>, images?: WatchImageFiles): Promise<Watch> => {
    const formPayload = new FormData();
    
    // Append form data (only fields that are provided)
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formPayload.append(key, value.toString());
      }
    });
    
    // Append image files if provided
    if (images) {
      Object.entries(images).forEach(([key, file]) => {
        if (file && file instanceof File) {
          formPayload.append(key, file);
        }
      });
    }

    const response = await protectedApiClient.put<ApiResponse<Watch>>(`/watches/${id}`, formPayload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for file upload
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update watch');
    }

    return response.data.data;
  },

  /**
   * Delete a watch (admin only)
   */
  deleteWatch: async (id: string): Promise<void> => {
    const response = await protectedApiClient.delete<ApiResponse<void>>(`/watches/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete watch');
    }
  },
};

// =================
// CART TYPES & SERVICES
// =================

export interface WatchColor {
  id: string;
  name: string;
  hex_code: string;
  quantity: number;
  is_active: boolean;
  sort_order: number;
  Watch: Watch;
}

export interface CartItem {
  id: string;
  user_id: string;
  watch_color_id: string;
  quantity: number;
  price_at_time: string;
  createdat: string;
  updatedat: string;
  watchColor: WatchColor;
}

export interface CartSummary {
  totalItems: number;
  totalAmount: string;
}

export interface CartResponse {
  success: boolean;
  data: {
    items: CartItem[];
    summary: CartSummary;
  };
}

export interface AddToCartRequest {
  watchColorIds: Array<{
    watch_color_id: string;
    quantity: number;
  }>;
}

export interface AddToCartResult {
  index: number;
  action: 'created' | 'updated';
  data: CartItem;
}

export interface AddToCartResponse {
  success: boolean;
  message: string;
  results: AddToCartResult[];
}

export interface UpdateCartItemData {
  quantity: number;
}

export const cartServices = {
  /**
   * Get user cart with items and summary
   */
  getCart: async (): Promise<{ items: CartItem[]; summary: CartSummary }> => {
    const response = await protectedApiClient.get<CartResponse>('/cart');

    if (!response.data.success) {
      throw new Error('Failed to fetch cart');
    }

    return response.data.data;
  },

  /**
   * Add items to cart (bulk operation)
   */
  addToCart: async (data: AddToCartRequest): Promise<AddToCartResponse> => {
    const response = await protectedApiClient.post<AddToCartResponse>('/cart/add', data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to add items to cart');
    }

    return response.data;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (cartItemId: string, data: UpdateCartItemData): Promise<CartItem> => {
    const response = await protectedApiClient.put<ApiResponse<CartItem>>(`/cart/update/${cartItemId}`, data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update cart item');
    }

    return response.data.data;
  },

  /**
   * Remove single item from cart
   */
  removeFromCart: async (cartItemId: string): Promise<void> => {
    const response = await protectedApiClient.delete<ApiResponse<void>>(`/cart/delete/${cartItemId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to remove item from cart');
    }
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<void> => {
    const response = await protectedApiClient.delete<ApiResponse<void>>('/cart/clear');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to clear cart');
    }
  },

  /**
   * Get cart items count only (optimized for header badge)
   */
  getCartCount: async (): Promise<number> => {
    const response = await protectedApiClient.get<ApiResponse<{ count: number }>>('/cart/count');

    if (!response.data.success) {
      throw new Error('Failed to fetch cart count');
    }

    return response.data.data.count;
  },

  /**
   * Get cart summary only
   */
  getCartSummary: async (): Promise<CartSummary> => {
    const response = await protectedApiClient.get<ApiResponse<CartSummary>>('/cart/summary');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch cart summary');
    }

    return response.data.data;
  },
};

// =================
// ADDRESS TYPES & SERVICES
// =================

export interface Address {
  id: string;
  user_id: string;
  address_type: 'home' | 'work' | 'other';
  is_billing_address: boolean;
  is_shipping_address: boolean;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  country_code: string;
  is_default: boolean;
  is_verified: boolean;
  latitude?: number;
  longitude?: number;
  delivery_instructions?: string;
  landmark?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  address_type?: 'home' | 'work' | 'other';
  is_billing_address?: boolean;
  is_shipping_address?: boolean;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  country_code?: string;
  is_default?: boolean;
  delivery_instructions?: string;
  landmark?: string;
}

export interface UpdateAddressData extends CreateAddressData {
  id: string;
}

export const addressServices = {
  /**
   * Get all addresses for user
   */
  getAddresses: async (): Promise<Address[]> => {
    const response = await protectedApiClient.get<ApiResponse<Address[]>>('/address/all');
    if (!response.data.success) {
      throw new Error('Failed to fetch addresses');
    }
    return response.data.data;
  },

  /**
   * Get single address by ID
   */
  getAddress: async (addressId: string): Promise<Address> => {
    const response = await protectedApiClient.get<ApiResponse<Address>>(`/address/${addressId}`);
    if (!response.data.success) {
      throw new Error('Failed to fetch address');
    }
    return response.data.data;
  },

  /**
   * Create new address
   */
  createAddress: async (data: CreateAddressData): Promise<Address> => {
    const response = await protectedApiClient.post<ApiResponse<Address>>('/address', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create address');
    }
    return response.data.data;
  },

  /**
   * Update existing address
   */
  updateAddress: async (data: UpdateAddressData): Promise<Address> => {
    const response = await protectedApiClient.post<ApiResponse<Address>>('/address', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update address');
    }
    return response.data.data;
  },
};

// =================
// USER TYPES & SERVICES
// =================

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export const userServices = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await protectedApiClient.get<ApiResponse<UserProfile>>('/user/profile');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user profile');
    }
    
    return response.data.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await protectedApiClient.put<ApiResponse<UserProfile>>('/user/profile', data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update profile');
    }
    
    return response.data.data;
  },
};