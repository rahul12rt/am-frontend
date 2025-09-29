'use client';

import { useState, useCallback } from 'react';
import { useCreateOrder, useVerifyPayment, useCreateOrderAndShip } from '@/hooks/usePayment';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { useRouter } from 'next/navigation';

declare global {
  interface Window { Razorpay?: any }
}

export function useRazorpayCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const [paymentStage, setPaymentStage] = useState<'processing' | 'success' | 'creating-order' | 'completed'>('processing');

  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();
  const createOrderAndShipMutation = useCreateOrderAndShip();
  const queryClient = useQueryClient();
  const router = useRouter();

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        setSdkReady(true);
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => { setSdkReady(true); resolve(true); };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const payNow = useCallback(async (params: {
    totalAmountInRupees: number;
    itemsSummary: string;
    prefill?: { name?: string; email?: string; contact?: string };
    billingAddressId: string;
    shippingAddressId: string;
  }) => {
    const { totalAmountInRupees, itemsSummary, prefill, billingAddressId, shippingAddressId } = params;

    if (!totalAmountInRupees || totalAmountInRupees <= 0) {
      alert('Invalid amount');
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentStage('processing');

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load');
      }

      // 1) Create order
      const orderResponse = await createOrderMutation.mutateAsync({
        amount: totalAmountInRupees,
        currency: 'INR',
        receipt: `cart_${Date.now()}`,
      });

      if (!orderResponse?.success) throw new Error('Failed to create payment order');

      const { order_id, key_id, amount: orderAmount, currency } = orderResponse;
      if (!order_id || !key_id || !orderAmount) throw new Error('Missing required order details');

      // 2) Configure checkout
      const options = {
        key: key_id,
        amount: orderAmount, // paise from server
        currency: currency || 'INR',
        name: 'Alban Marcus',
        description: `Purchase: ${itemsSummary}`,
        order_id,
        prefill: {
          name: prefill?.name || 'Customer',
          email: prefill?.email || 'customer@example.com',
          contact: prefill?.contact || '9999999999',
        },
        theme: { color: '#000000' },
        handler: async (resp: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Stage 1: Client callback from Razorpay (not final truth)
          if (resp?.razorpay_payment_id && resp?.razorpay_order_id && resp?.razorpay_signature) {
            console.log('Payment successful (client callback)', {
              order_id: resp.razorpay_order_id,
              payment_id: resp.razorpay_payment_id,
            });
          } else {
            console.error('Payment failed (client callback): Missing fields', resp);
            alert('Payment failed. Please try again.');
            setIsProcessing(false);
            return;
          }

          try {
            // Stage 2: Complete order creation flow
            const orderResponse = await createOrderAndShipMutation.mutateAsync({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              billing_address_id: billingAddressId,
              shipping_address_id: shippingAddressId,
            });
            if (orderResponse?.success) {
              console.log('Order created successfully', orderResponse);
              
              queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });
              
              // Show success message
              alert(`Order placed successfully! Order ID: ${orderResponse.order.id}`);
              
              // Redirect to order success page
              router.push(`/order-success?orderId=${orderResponse.order.id}`);
            } else {
              console.error('Order creation failed', orderResponse);
              alert('Payment successful but order creation failed. Please contact support.');
            }
          } catch (err) {
            alert('Payment successful but order creation failed. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        }
        ,
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      };

      // 4) Open checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error('Payment initiation error:', e);
      alert(e?.message || 'Failed to initiate payment');
    } finally {
      setIsProcessing(false);
    }
  }, [createOrderMutation, verifyPaymentMutation, createOrderAndShipMutation, loadRazorpayScript, queryClient, router]);

  return { 
    payNow, 
    isProcessing, 
    sdkReady, 
    createOrderMutation, 
    verifyPaymentMutation, 
    createOrderAndShipMutation 
  };
}
