import { protectedApiClient } from "../lib/api-clients";
import { AddToCartPayload, CartAPIResponse, UpdateCartQuantityPayload } from "../types/cart";

export const getCart = async (): Promise<CartAPIResponse> => {
  const response = await protectedApiClient.get("/cart");
  return response.data;
};

export const addToCart = async (items: AddToCartPayload[]): Promise<any> => {
  const response = await protectedApiClient.post("/cart/add", { watchColorIds: items });
  return response.data;
};

export const updateCartItemQuantity = async (cartItemId: string, payload: UpdateCartQuantityPayload): Promise<any> => {
  const response = await protectedApiClient.put(`/cart/update/${cartItemId}`, payload);
  return response.data;
};

export const removeCartItem = async (cartItemId: string): Promise<any> => {
  const response = await protectedApiClient.delete(`/cart/delete/${cartItemId}`);
  return response.data;
};

export const clearCart = async (): Promise<any> => {
  const response = await protectedApiClient.delete("/cart/clear");
  return response.data;
};
