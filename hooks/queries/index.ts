/**
 * Query Hooks Index
 * 
 * This file provides a centralized export for all TanStack Query hooks
 * making imports cleaner and more organized throughout the application.
 */

// Watch-related hooks
export * from './useWatches';

// Cart-related hooks  
export * from './useCart';

// User-related hooks
export * from './useUser';

// Re-export commonly used types for convenience
export type {
  Watch,
  WatchFilters,
  WatchFormData,
  WatchImage,
  CartItem,
  AddToCartData,
  UpdateCartData,
  UserProfile,
  UpdateProfileData,
  Address,
  CreateAddressData,
} from '@/lib/api-services';

// Re-export query keys
export { queryKeys } from '@/lib/query-keys';