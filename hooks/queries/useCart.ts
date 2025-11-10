/**
 * Cart Query Hooks
 * 
 * This file provides all TanStack Query hooks for cart-related operations
 * using the standardized query key factory and API services.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  cartServices,
  type CartItem,
  type CartSummary,
  type AddToCartRequest,
  type AddToCartResponse,
  type UpdateCartItemData,
} from '@/lib/api-services';
import { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api-clients';
import { useMemo } from 'react';

// =================
// QUERY HOOKS (READ OPERATIONS)
// =================

/**
 * Get cart with items and summary
 */
export const useCart = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.cart.items(),
    queryFn: cartServices.getCart,
    staleTime: 30 * 1000, // 30 seconds (cart data should be fresh)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: enabled, // Only run query when enabled (user is authenticated)
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false, // Disable auto-refetch to prevent constant reloading
  });
};

/**
 * Get cart items count (optimized - direct API call)
 */
export const useCartCount = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.cart.count(),
    queryFn: cartServices.getCartCount,
    staleTime: 10 * 1000, // 10 seconds (keep count fresh)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: enabled, // Only run query when enabled (user is authenticated)
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true, // Enable refetch to keep count updated
    refetchInterval: 30 * 1000, // Refetch every 30 seconds when focused
  });
};

/**
 * Get cart items count (fallback - derived from cart data)
 */
export const useCartCountFromCache = (enabled: boolean = true) => {
  const { data: cartData, ...rest } = useCart(enabled);

  const count = useMemo(() => {
    if (!cartData?.items) return 0;
    return cartData.items.reduce((total, item) => total + item.quantity, 0);
  }, [cartData]);

  return {
    ...rest,
    data: count,
  };
};

/**
 * Get cart total price (derived from cart data)
 */
export const useCartTotal = (enabled: boolean = true, userProfile?: any) => {
  const { data: cartData, ...rest } = useCart(enabled);

  const total = useMemo(() => {
    if (!cartData?.items || cartData.items.length === 0) return { 
      subtotal: 0, 
      total: 0, 
      savings: 0, 
      itemCount: 0, 
      discount: 0,
      discountAmount: 0,
      finalTotal: 0,
      eligibleForDiscount: false
    };

    let subtotal = 0;
    let actualTotal = 0;

    // Calculate from cart items
    cartData.items.forEach(item => {
      let offerPrice = 0;
      let actualPrice = 0;
      
      if (item.watchColor?.Watch) {
        offerPrice = parseFloat(item.watchColor.Watch.offerprice?.toString() || '0');
        actualPrice = parseFloat(item.watchColor.Watch.actualprice?.toString() || '0');
      } else if ((item as any).price) {
        offerPrice = parseFloat((item as any).price.toString());
        actualPrice = offerPrice; // Assume no savings if we can't get actual price
      } else if ((item.watchColor as any)?.price) {
        offerPrice = parseFloat((item.watchColor as any).price.toString());
        actualPrice = offerPrice; // Assume no savings if we can't get actual price
      }

      subtotal += offerPrice * item.quantity;
      actualTotal += actualPrice * item.quantity;
    });

    // Fallback to cart summary if item calculation fails
    if (subtotal === 0 && cartData.summary?.totalAmount) {
      subtotal = parseFloat(cartData.summary.totalAmount);
      actualTotal = subtotal; // Assume no savings if we can't calculate from items
    }

    const savings = actualTotal - subtotal;
    
    // Apply 10% discount if user is eligible
    const eligibleForDiscount = userProfile?.eligibleForDiscount || false;
    const discountPercentage = eligibleForDiscount ? 10 : 0;
    const discountAmount = eligibleForDiscount ? (subtotal * 0.1) : 0;
    const finalTotal = subtotal - discountAmount;

    // Debug logging disabled for production

    return {
      subtotal,
      total: subtotal,
      savings,
      itemCount: cartData.items.length,
      totalAmount: cartData.summary?.totalAmount ? parseFloat(cartData.summary.totalAmount) : subtotal,
      discount: discountPercentage,
      discountAmount,
      finalTotal,
      eligibleForDiscount
    };
  }, [cartData, userProfile]);

  return {
    ...rest,
    data: total,
  };
};

/**
 * Check if a specific watch color is in cart
 */
export const useIsInCart = (watchColorId: string, enabled: boolean = true) => {
  const { data: cartData } = useCart(enabled);

  const isInCart = useMemo(() => {
    if (!cartData?.items || !watchColorId) return false;
    return cartData.items.some((item: any) => item.watch_color_id === watchColorId);
  }, [cartData, watchColorId]);

  const cartItem = useMemo(() => {
    if (!cartData?.items || !watchColorId) return null;
    return cartData.items.find((item: any) => item.watch_color_id === watchColorId) || null;
  }, [cartData, watchColorId]);

  return { isInCart, cartItem };
};

// =================
// MUTATION HOOKS (WRITE OPERATIONS)
// =================

/**
 * Add items to cart (bulk operation)
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartServices.addToCart(data),

    onMutate: async (newItems) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

      // Snapshot the previous value
      const previousCartData = queryClient.getQueryData(queryKeys.cart.items());

      return { previousCartData };
    },

    onSuccess: (response: AddToCartResponse) => {
      // Invalidate cart queries to get fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });
      // Force refetch of cart count for immediate UI update
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.count() });
      queryClient.refetchQueries({ queryKey: queryKeys.cart.count() });

      // Success logging disabled for production
    },

    onError: (error: AxiosError, newItems, context) => {
      // Revert the optimistic update on error
      if (context?.previousCartData) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCartData);
      }

      const errorMessage = handleApiError(error);
      // Error logging disabled for production

      // Re-throw error so component can handle it
      throw error;
    },

    onSettled: () => {
      // Always refetch after mutation to ensure cache is correct
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items() });
    },
  });
};

/**
 * Update cart item quantity
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartItemId, data }: { cartItemId: string; data: UpdateCartItemData }) =>
      cartServices.updateCartItem(cartItemId, data),

    onMutate: async ({ cartItemId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

      const previousCartData = queryClient.getQueryData(queryKeys.cart.items());

      return { previousCartData };
    },

    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });
      // Force refetch of cart count for immediate UI update
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.count() });
      queryClient.refetchQueries({ queryKey: queryKeys.cart.count() });
      // Success logging disabled for production
    },

    onError: (error: AxiosError, variables, context) => {
      if (context?.previousCartData) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCartData);
      }

      const errorMessage = handleApiError(error);
      // Error logging disabled for production

      // Re-throw error so component can handle it
      throw error;
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items() });
    },
  });
};

/**
 * Remove item from cart
 */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId: string) => cartServices.removeFromCart(cartItemId),

    onMutate: async (cartItemId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

      const previousCartData = queryClient.getQueryData(queryKeys.cart.items());

      return { previousCartData };
    },

    onSuccess: (_, cartItemId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });
      // Force refetch of cart count for immediate UI update
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.count() });
      queryClient.refetchQueries({ queryKey: queryKeys.cart.count() });
      // Success logging disabled for production
    },

    onError: (error: AxiosError, cartItemId, context) => {
      if (context?.previousCartData) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCartData);
      }

      const errorMessage = handleApiError(error);
      // Error logging disabled for production

      // Re-throw error so component can handle it
      throw error;
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items() });
    },
  });
};

/**
 * Clear entire cart
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartServices.clearCart,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

      const previousCartData = queryClient.getQueryData(queryKeys.cart.items());

      return { previousCartData };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });
      // Force refetch of cart count for immediate UI update
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.count() });
      queryClient.refetchQueries({ queryKey: queryKeys.cart.count() });
      // Success logging disabled for production
    },

    onError: (error: AxiosError, _, context) => {
      if (context?.previousCartData) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCartData);
      }

      const errorMessage = handleApiError(error);
      // Error logging disabled for production

      // Re-throw error so component can handle it
      throw error;
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });
    },
  });
};

// =================
// UTILITY HOOKS
// =================

/**
 * Get cart summary data (count + total)
 */
export const useCartSummary = (enabled: boolean = true) => {
  const { data: count, isLoading: countLoading } = useCartCount(enabled);
  const { data: total, isLoading: totalLoading } = useCartTotal(enabled);

  return {
    count,
    total,
    isLoading: countLoading || totalLoading,
  };
};

/**
 * Batch cart operations
 */
export const useCartOperations = () => {
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  return {
    addToCart,
    updateCartItem, 
    removeFromCart,
    clearCart,
    isLoading: addToCart.isPending || updateCartItem.isPending || 
               removeFromCart.isPending || clearCart.isPending,
  };
};

/**
 * Smart add to cart with quantity handling
 */
export const useSmartAddToCart = () => {
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();

  return {
    addOrUpdateCart: (watchColorId: string, quantity: number = 1) => {
      const { isInCart: watchColorIsInCart, cartItem: watchColorCartItem } = useIsInCart(watchColorId);

      if (watchColorIsInCart && watchColorCartItem) {
        // Update existing item
        return updateCartItem.mutateAsync({
          cartItemId: watchColorCartItem.id,
          data: { quantity: watchColorCartItem.quantity + quantity },
        });
      } else {
        // Add new item
        return addToCart.mutateAsync({
          watchColorIds: [{ watch_color_id: watchColorId, quantity }]
        });
      }
    },
    isPending: addToCart.isPending || updateCartItem.isPending,
  };
};