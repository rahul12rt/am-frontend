export interface CartItem {
  id: string;
  watch_color_id: string; // Keep for compatibility with useIsInCart hook
  name: string;
  category: string;
  modelGroup: string;
  price: string;
  quantity: number;
  imageURL: string;
  color: string;
  inlinePrice: string;
}

export interface CartSummary {
  totalItems: number;
  totalAmount: string;
}

export interface CartAPIResponse {
  success: boolean;
  data: {
    items: CartItem[];
    summary: CartSummary;
  };
}

export interface AddToCartPayload {
  watch_color_id: string;
  quantity: number;
}

export interface UpdateCartQuantityPayload {
  quantity: number;
}
