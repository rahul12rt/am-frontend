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

// Hook to create order
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
      console.log("Order created successfully:", data);
    },
    onError: (error: AxiosError) => {
      console.error("Order creation failed:", handleApiError(error));
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
      console.log("Payment verified successfully:", data);
    },
    onError: (error: AxiosError) => {
      console.error("Payment verification failed:", handleApiError(error));
    },
  });
};
