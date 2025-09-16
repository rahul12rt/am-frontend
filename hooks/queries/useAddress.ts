/**
 * Address Query Hooks
 *
 * This file provides all TanStack Query hooks for address-related operations
 * following the standardized query key factory and API services pattern.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  addressServices,
  type Address,
  type CreateAddressData,
  type UpdateAddressData,
} from '@/lib/api-services';
import { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api-clients';
import { useMemo } from 'react';

// =================
// QUERY HOOKS (READ OPERATIONS)
// =================

/**
 * Get all addresses for user
 */
export const useAddresses = () => {
  return useQuery({
    queryKey: queryKeys.addresses.lists(),
    queryFn: addressServices.getAddresses,
    staleTime: 5 * 60 * 1000, // 5 minutes (addresses don't change often)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Get single address by ID
 */
export const useAddress = (addressId: string) => {
  return useQuery({
    queryKey: queryKeys.addresses.detail(addressId),
    queryFn: () => addressServices.getAddress(addressId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!addressId,
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Get default address for user
 */
export const useDefaultAddress = () => {
  const { data: addresses, ...rest } = useAddresses();

  const defaultAddress = useMemo(() => {
    if (!addresses) return null;
    return addresses.find(address => address.is_default) || null;
  }, [addresses]);

  return {
    ...rest,
    data: defaultAddress,
  };
};

/**
 * Get billing addresses
 */
export const useBillingAddresses = () => {
  const { data: addresses, ...rest } = useAddresses();

  const billingAddresses = useMemo(() => {
    if (!addresses) return [];
    return addresses.filter(address => address.is_billing_address);
  }, [addresses]);

  return {
    ...rest,
    data: billingAddresses,
  };
};

/**
 * Get shipping addresses
 */
export const useShippingAddresses = () => {
  const { data: addresses, ...rest } = useAddresses();

  const shippingAddresses = useMemo(() => {
    if (!addresses) return [];
    return addresses.filter(address => address.is_shipping_address);
  }, [addresses]);

  return {
    ...rest,
    data: shippingAddresses,
  };
};

// =================
// MUTATION HOOKS (WRITE OPERATIONS)
// =================

/**
 * Create new address
 */
export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressData) => addressServices.createAddress(data),

    onSuccess: (newAddress) => {
      // Invalidate and refetch addresses
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all() });
      console.log('Address created successfully:', newAddress.id);
    },

    onError: (error: AxiosError) => {
      const errorMessage = handleApiError(error);
      console.error('Failed to create address:', errorMessage);
      // Re-throw error so component can handle it
      throw error;
    },
  });
};

/**
 * Update existing address
 */
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAddressData) => addressServices.updateAddress(data),

    onMutate: async (updatedAddress) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.addresses.all() });
      await queryClient.cancelQueries({ queryKey: queryKeys.addresses.detail(updatedAddress.id) });

      // Snapshot the previous values
      const previousAddresses = queryClient.getQueryData(queryKeys.addresses.lists());
      const previousAddress = queryClient.getQueryData(queryKeys.addresses.detail(updatedAddress.id));

      return { previousAddresses, previousAddress };
    },

    onSuccess: (updatedAddress) => {
      // Update the cache
      queryClient.setQueryData(queryKeys.addresses.detail(updatedAddress.id), updatedAddress);
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.lists() });
      console.log('Address updated successfully:', updatedAddress.id);
    },

    onError: (error: AxiosError, updatedAddress, context) => {
      // Rollback cache on error
      if (context?.previousAddresses) {
        queryClient.setQueryData(queryKeys.addresses.lists(), context.previousAddresses);
      }
      if (context?.previousAddress) {
        queryClient.setQueryData(queryKeys.addresses.detail(updatedAddress.id), context.previousAddress);
      }

      const errorMessage = handleApiError(error);
      console.error('Failed to update address:', errorMessage);
      // Re-throw error so component can handle it
      throw error;
    },

    onSettled: () => {
      // Always refetch to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all() });
    },
  });
};

// =================
// UTILITY HOOKS
// =================

/**
 * Address management utilities
 */
export const useAddressOperations = () => {
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();

  return {
    createAddress,
    updateAddress,
    isLoading: createAddress.isPending || updateAddress.isPending,
  };
};

/**
 * Check if user has addresses
 */
export const useHasAddresses = () => {
  const { data: addresses, isLoading } = useAddresses();

  const hasAddresses = useMemo(() => {
    return addresses && addresses.length > 0;
  }, [addresses]);

  return {
    hasAddresses,
    isLoading,
    addressCount: addresses?.length || 0,
  };
};