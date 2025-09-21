/**
 * User Profile Query Hooks
 * 
 * This file provides all TanStack Query hooks for user-related operations
 * using the standardized query key factory and API services.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { 
  userServices, 
  addressServices,
  type UserProfile, 
  type UpdateProfileData,
  type Address,
  type CreateAddressData,
} from '@/lib/api-services';
import { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api-clients';
import { createClient } from '@/lib/supabase';

// =================
// USER PROFILE HOOKS
// =================

/**
 * Get current user profile
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: userServices.getProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    // Only run query if user is authenticated (let the query handle this)
    enabled: typeof window !== 'undefined',
  });
};

/**
 * Update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => userServices.updateProfile(data),
    
    onMutate: async (updatedData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.user.profile() });
      
      // Snapshot the previous profile
      const previousProfile = queryClient.getQueryData<UserProfile>(queryKeys.user.profile());
      
      // Optimistically update the profile
      if (previousProfile) {
        const optimisticProfile: UserProfile = {
          ...previousProfile,
          ...updatedData,
          updatedAt: new Date().toISOString(),
        };
        
        queryClient.setQueryData(queryKeys.user.profile(), optimisticProfile);
      }
      
      return { previousProfile };
    },
    
    onSuccess: (updatedProfile) => {
      // Update the cache with the actual response
      queryClient.setQueryData(queryKeys.user.profile(), updatedProfile);
      console.log('Profile updated successfully:', updatedProfile);
    },
    
    onError: (error: AxiosError, updatedData, context) => {
      // Revert the optimistic update on error
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKeys.user.profile(), context.previousProfile);
      }
      
      const errorMessage = handleApiError(error);
      console.error('Failed to update profile:', errorMessage);
    },
  });
};

// =================
// ADDRESS MANAGEMENT HOOKS
// =================

/**
 * Get all user addresses
 */
export const useAddresses = () => {
  return useQuery({
    queryKey: queryKeys.addresses.lists(),
    queryFn: addressServices.getAddresses,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    enabled: typeof window !== 'undefined',
  });
};

/**
 * Get default address
 */
export const useDefaultAddress = () => {
  const { data: addresses, ...rest } = useAddresses();
  
  const defaultAddress = addresses?.find(address => address.isDefault) || null;
  
  return {
    ...rest,
    data: defaultAddress,
  };
};

/**
 * Create new address
 */
export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressData) => addressServices.createAddress(data),
    
    onSuccess: (newAddress) => {
      // Add the new address to the cache
      queryClient.setQueryData<Address[]>(
        queryKeys.addresses.lists(),
        (old) => old ? [...old, newAddress] : [newAddress]
      );
      
      // If this is set as default, invalidate to refresh the list
      if (newAddress.isDefault) {
        queryClient.invalidateQueries({ queryKey: queryKeys.addresses.lists() });
      }
      
      console.log('Address created successfully:', newAddress);
    },
    
    onError: (error: AxiosError) => {
      const errorMessage = handleApiError(error);
      console.error('Failed to create address:', errorMessage);
    },
  });
};

/**
 * Update address
 */
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAddressData> }) => 
      addressServices.updateAddress(id, data),
    
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.addresses.lists() });
      
      const previousAddresses = queryClient.getQueryData<Address[]>(queryKeys.addresses.lists());
      
      // Optimistically update the address
      if (previousAddresses) {
        const updatedAddresses = previousAddresses.map(address => 
          address.id === id 
            ? { ...address, ...data, updatedAt: new Date().toISOString() }
            : address
        );
        
        queryClient.setQueryData<Address[]>(queryKeys.addresses.lists(), updatedAddresses);
      }
      
      return { previousAddresses };
    },
    
    onSuccess: (updatedAddress) => {
      // Update the specific address and invalidate if default status changed
      queryClient.setQueryData<Address[]>(
        queryKeys.addresses.lists(),
        (old) => old?.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr) || []
      );
      
      if (updatedAddress.isDefault) {
        queryClient.invalidateQueries({ queryKey: queryKeys.addresses.lists() });
      }
      
      console.log('Address updated successfully:', updatedAddress);
    },
    
    onError: (error: AxiosError, variables, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(queryKeys.addresses.lists(), context.previousAddresses);
      }
      
      const errorMessage = handleApiError(error);
      console.error('Failed to update address:', errorMessage);
    },
  });
};

/**
 * Delete address
 */
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressServices.deleteAddress(id),
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.addresses.lists() });
      
      const previousAddresses = queryClient.getQueryData<Address[]>(queryKeys.addresses.lists());
      
      // Optimistically remove the address
      if (previousAddresses) {
        const filteredAddresses = previousAddresses.filter(address => address.id !== id);
        queryClient.setQueryData<Address[]>(queryKeys.addresses.lists(), filteredAddresses);
      }
      
      return { previousAddresses };
    },
    
    onSuccess: (_, deletedId) => {
      console.log('Address deleted successfully:', deletedId);
    },
    
    onError: (error: AxiosError, deletedId, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(queryKeys.addresses.lists(), context.previousAddresses);
      }
      
      const errorMessage = handleApiError(error);
      console.error('Failed to delete address:', errorMessage);
    },
    
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.lists() });
    },
  });
};

// =================
// UTILITY HOOKS
// =================

/**
 * Check if user profile is complete
 */
export const useIsProfileComplete = () => {
  const { data: profile } = useUserProfile();
  
  const isComplete = profile ? 
    !!(profile.first_name && profile.phone && profile.email) : 
    false;
  
  const missingFields = profile ? 
    [
      !profile.first_name && 'first_name',
      !profile.phone && 'phone', 
      !profile.email && 'email'
    ].filter(Boolean) as string[] : 
    [];

  return {
    isComplete,
    missingFields,
    profile,
  };
};

/**
 * Get user's shipping addresses (non-office addresses)
 */
export const useShippingAddresses = () => {
  const { data: addresses, ...rest } = useAddresses();
  
  const shippingAddresses = addresses?.filter(
    address => address.type === 'home' || address.type === 'other'
  ) || [];
  
  return {
    ...rest,
    data: shippingAddresses,
  };
};

/**
 * Get user's billing addresses (could be any type but typically home/office)
 */
export const useBillingAddresses = () => {
  const { data: addresses, ...rest } = useAddresses();
  
  // For billing, we typically want all addresses
  const billingAddresses = addresses || [];
  
  return {
    ...rest,
    data: billingAddresses,
  };
};

/**
 * Batch user operations
 */
export const useUserOperations = () => {
  const updateProfile = useUpdateProfile();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  return {
    updateProfile,
    createAddress,
    updateAddress,
    deleteAddress,
    isLoading: updateProfile.isPending || createAddress.isPending || 
               updateAddress.isPending || deleteAddress.isPending,
  };
};

/**
 * Send email OTP for verification
 */
export const useSendEmailOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => userServices.sendEmailOTP(email),
    
    onSuccess: (response) => {
      console.log('OTP sent successfully:', response.message);
    },
    
    onError: (error: AxiosError) => {
      const errorMessage = handleApiError(error);
      console.error('Failed to send OTP:', errorMessage);
    },
  });
};

/**
 * Verify email OTP
 */
export const useVerifyEmailOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => 
      userServices.verifyEmailOTP(email, otp),
    
    onSuccess: (response) => {
      // Invalidate profile to refresh email verification status
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      console.log('Email verified successfully:', response);
    },
    
    onError: (error: AxiosError) => {
      const errorMessage = handleApiError(error);
      console.error('Failed to verify email:', errorMessage);
    },
  });
};

/**
 * User authentication status and profile data combined
 */
export const useAuth = () => {
  const { data: profile, isLoading, error } = useUserProfile();
  const supabase = createClient();

  // Check if user has an active session
  const isAuthenticated = !!profile;

  return {
    user: profile,
    profile, // Add profile alias for backward compatibility
    isAuthenticated,
    isLoading,
    loading: isLoading, // Add loading alias for backward compatibility
    error,
    isReady: !isLoading && isAuthenticated,
  };
};