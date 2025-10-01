import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { protectedApiClient, handleApiError } from "../lib/api-clients";
import { AxiosError } from "axios";

// Types (you can add these to your existing types file)
interface CreateOrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
}

interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface VerifyPaymentResponse {
  message: string;
  payment_id: string;
  order_id: string;
}

interface CartItem {
  id: string;
  watch_color_id: string;
  name: string;
  category: string;
  modelGroup: string;
  price: string;
  quantity: number;
  imageURL: string;
  color: string;
  inlinePrice: string;
}

interface CreateOrderAndShipRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  billing_address_id: string;
  shipping_address_id: string;
  cart_data: {
    items: CartItem[];
    summary: {
      totalItems: string;
      totalAmount: string;
    };
  };
}

interface CreateOrderAndShipResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    orderNumber: string;
    waybill: string;
    totalAmount: number;
    status: string;
  };
}

// Hook to create order
// Hook to create Razorpay order (payment order, not business order)
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const response = await protectedApiClient.post(
        "/payment/create-order",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Success logging disabled for production
    },
    onError: (error: AxiosError) => {
      // Error logging disabled for production
    },
  });
};

// Hook to verify payment
export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: async (data: VerifyPaymentRequest) => {
      const response = await protectedApiClient.post("/payment/verify", data);
      return response.data;
    },
    onSuccess: (data) => {
      // Success logging disabled for production
    },
    onError: (error: AxiosError) => {
      // Error logging disabled for production
    },
  });
};

// Hook to create order and ship after payment verification
export const useCreateOrderAndShip = () => {
  return useMutation({
    mutationFn: async (data: CreateOrderAndShipRequest) => {
      const response = await protectedApiClient.post("/payment/create-order-and-ship", data, {
        timeout: 45000, // 45 seconds for order creation with shipping integration
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Success logging disabled for production
    },
    onError: (error: AxiosError) => {
      // Error logging disabled for production
    },
  });
};
