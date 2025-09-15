import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../services/cart";
import { AddToCartPayload, UpdateCartQuantityPayload } from "../types/cart";

const CART_QUERY_KEY = ["cart"];

export const useCart = () => {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: api.getCart,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: AddToCartPayload[]) => api.addToCart(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useUpdateCartItemQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cartItemId, payload }: { cartItemId: string; payload: UpdateCartQuantityPayload }) =>
      api.updateCartItemQuantity(cartItemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cartItemId: string) => api.removeCartItem(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};
