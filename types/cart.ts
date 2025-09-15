import  Watch  from "./watch/watch";
export interface CartItem {
  id: string;
  user_id: string;
  watch_color_id: string;
  quantity: number;
  price_at_time: string;
  createdat: string;
  updatedat: string;
  watchColor: {
    id: string;
    name: string;
    hex_code: string;
    quantity: number;
    is_active: boolean;
    Watch: Watch;
  };
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
