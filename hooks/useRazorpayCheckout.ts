'use client';

import { useState, useCallback } from 'react';
import { useCreateOrder, useVerifyPayment, useCreateOrderAndShip } from '@/hooks/usePayment';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { useRouter } from 'next/navigation';

declare global {
  interface Window { 
    Razorpay?: any;
  }
}

export function useRazorpayCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStage, setPaymentStage] = useState<'idle' | 'processing' | 'payment_success' | 'creating_order' | 'success' | 'error'>('idle');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [sdkReady, setSdkReady] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

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
    cartData: any; // Cart data to lock and send to backend
  }) => {
    const { totalAmountInRupees, itemsSummary, prefill, billingAddressId, shippingAddressId, cartData } = params;

    if (!totalAmountInRupees || totalAmountInRupees <= 0) {
      alert('Invalid amount');
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentStage('processing');
      setLoadingMessage('Initializing payment...');

      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set a timeout to reset state if stuck (5 minutes)
      const newTimeoutId = setTimeout(() => {
        console.warn('Payment process timed out, resetting state');
        setPaymentStage('error');
        setLoadingMessage('Payment process timed out. Please try again.');
        setTimeout(() => {
          setIsProcessing(false);
          setPaymentStage('idle');
          setLoadingMessage('');
        }, 3000);
      }, 5 * 60 * 1000); // 5 minutes
      setTimeoutId(newTimeoutId);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load');
      }

      setLoadingMessage('Creating payment order...');

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
          // Stage 1: Payment successful from Razorpay
          setPaymentStage('payment_success');
          setLoadingMessage('Payment successful! Creating your order...');
          
          if (!resp?.razorpay_payment_id || !resp?.razorpay_order_id || !resp?.razorpay_signature) {
            console.error('Payment failed: Missing fields', resp);
            setPaymentStage('error');
            setLoadingMessage('Payment failed. Please try again.');
            setIsProcessing(false);
            return;
          }

          try {
            // Stage 2: Create order and shipment
            setPaymentStage('creating_order');
            setLoadingMessage('Processing your order and arranging shipment...');
            
            const orderResponse = await createOrderAndShipMutation.mutateAsync({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              billing_address_id: billingAddressId,
              shipping_address_id: shippingAddressId,
              cart_data: cartData, // Send locked cart data from frontend
            });
            
            if (orderResponse?.success) {
              console.log('Order created successfully', orderResponse);
              
              // Clear timeout on success
              if (timeoutId) {
                clearTimeout(timeoutId);
                setTimeoutId(null);
              }
              
              setPaymentStage('success');
              setLoadingMessage('Order created successfully! Redirecting...');
              
              // Refresh cart data (backend has already cleared the cart)
              queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() });
              // Also invalidate specific cart queries to ensure UI updates
              queryClient.invalidateQueries({ queryKey: queryKeys.cart.items() });
              queryClient.invalidateQueries({ queryKey: queryKeys.cart.count() });
              // Force immediate refetch of cart count for instant UI update
              queryClient.refetchQueries({ queryKey: queryKeys.cart.count() });
              
              // Redirect to order success page
              setTimeout(() => {
                router.push(`/order-success?orderId=${orderResponse.order.id}`);
              }, 1500);
            } else {
              console.error('Order creation failed', orderResponse);
              setPaymentStage('error');
              setLoadingMessage('Payment successful but order creation failed. Please contact support.');
            }
          } catch (err) {
            console.error('Order creation error:', err);
            setPaymentStage('error');
            setLoadingMessage('Payment successful but order creation failed. Please contact support.');
          } finally {
            setTimeout(() => setIsProcessing(false), 2000);
          }
        }
        ,
        modal: {
          ondismiss: () => {
            console.log('Razorpay modal dismissed by user');
            setIsProcessing(false);
            setPaymentStage('idle');
            setLoadingMessage('');
          },
        },
      };

      // 4) Open checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error('Payment initiation error:', e);
      setPaymentStage('error');
      setLoadingMessage('Failed to initiate payment. Please try again.');
      setTimeout(() => {
        setPaymentStage('idle');
        setLoadingMessage('');
        setIsProcessing(false);
      }, 3000);
    } finally {
      // Don't reset here immediately as we want to show error states
    }
  }, [createOrderMutation, verifyPaymentMutation, createOrderAndShipMutation, loadRazorpayScript, queryClient, router]);

  const cancelPayment = useCallback(() => {
    // Clear timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsProcessing(false);
    setPaymentStage('idle');
    setLoadingMessage('');
  }, [timeoutId]);

  const retryPayment = useCallback((params: any) => {
    setPaymentStage('idle');
    setLoadingMessage('');
    setIsProcessing(false);
    // Allow user to try payment again
    setTimeout(() => {
      payNow(params);
    }, 500);
  }, [payNow]);

  return { 
    payNow, 
    isProcessing, 
    paymentStage,
    loadingMessage,
    cancelPayment,
    retryPayment,
    sdkReady, 
    createOrderMutation, 
    verifyPaymentMutation, 
    createOrderAndShipMutation 
  };
}
