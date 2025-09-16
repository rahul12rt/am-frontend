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
export const useCart = () => {
  return useQuery({
    queryKey: queryKeys.cart.items(),
    queryFn: cartServices.getCart,
    staleTime: 30 * 1000, // 30 seconds (cart data should be fresh)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true, // Always refetch cart when window gains focus
  });
};

/**
 * Get cart items count (optimized - direct API call)
 */
export const useCartCount = () => {
  return useQuery({
    queryKey: queryKeys.cart.count(),
    queryFn: cartServices.getCartCount,
    staleTime: 60 * 1000, // 1 minute (count can be slightly stale)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
  });
};

/**
 * Get cart items count (fallback - derived from cart data)
 */
export const useCartCountFromCache = () => {
  const { data: cartData, ...rest } = useCart();

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
export const useCartTotal = () => {
  const { data: cartData, ...rest } = useCart();

  const total = useMemo(() => {
    if (!cartData?.items) return { subtotal: 0, total: 0, savings: 0, itemCount: 0 };

    let subtotal = 0;
    let actualTotal = 0;

    cartData.items.forEach(item => {
      if (item.watchColor?.Watch) {
        const offerPrice = parseFloat(item.watchColor.Watch.offerprice.toString());
        const actualPrice = parseFloat(item.watchColor.Watch.actualprice.toString());

        subtotal += offerPrice * item.quantity;
        actualTotal += actualPrice * item.quantity;
      }
    });

    const savings = actualTotal - subtotal;

    return {
      subtotal,
      total: subtotal,
      savings,
      itemCount: cartData.items.length,
      totalAmount: cartData.summary?.totalAmount ? parseFloat(cartData.summary.totalAmount) : subtotal,
    };
  }, [cartData]);

  return {
    ...rest,
    data: total,
  };
};

/**
 * Check if a specific watch color is in cart
 */
export const useIsInCart = (watchColorId: string) => {
  const { data: cartData } = useCart();

  const isInCart = useMemo(() => {
    if (!cartData?.items || !watchColorId) return false;
    return cartData.items.some(item => item.watch_color_id === watchColorId);
  }, [cartData, watchColorId]);

  const cartItem = useMemo(() => {
    if (!cartData?.items || !watchColorId) return null;
    return cartData.items.find(item => item.watch_color_id === watchColorId) || null;
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

      console.log('Items added to cart successfully:', response.message);
    },

    onError: (error: AxiosError, newItems, context) => {
      // Revert the optimistic update on error
      if (context?.previousCartData) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCartData);
      }

      const errorMessage = handleApiError(error);
      console.error('Failed to add items to cart:', errorMessage);

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
      console.log('Cart item updated successfully:', updatedItem);
    },

    onError: (error: AxiosError, variables, context) => {
      if (context?.previousCartData) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCartData);
      }

      const errorMessage = handleApiError(error);
      console.error('Failed to update cart item:', errorMessage);

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
      console.log('Item removed from cart successfully:', cartItemId);
    },

    onError: (error: AxiosError, cartItemId, context) => {
      if (context?.previousCartData) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCartData);
      }

      const errorMessage = handleApiError(error);
      console.error('Failed to remove item from cart:', errorMessage);

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
      console.log('Cart cleared successfully');
    },

    onError: (error: AxiosError, _, context) => {
      if (context?.previousCartData) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCartData);
      }

      const errorMessage = handleApiError(error);
      console.error('Failed to clear cart:', errorMessage);

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
export const useCartSummary = () => {
  const { data: count, isLoading: countLoading } = useCartCount();
  const { data: total, isLoading: totalLoading } = useCartTotal();

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