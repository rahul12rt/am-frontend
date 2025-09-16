"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, X, Loader2, CreditCard, Shield } from "lucide-react";
import EmailVerificationModal from "@/components/organisms/checkout/EmailVerificationModal";
import PaymentIcons from "@/components/atoms/PaymentIcons";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  useCart, 
  useUpdateCartItem, 
  useRemoveFromCart, 
  useCartTotal, 
  useCartCount 
} from "@/hooks/queries/useCart";
import styles from './Cart.module.scss';

const CartPage: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const { data: cartData, isLoading: cartLoading, error: cartError } = useCart();
  const { data: totalData } = useCartTotal();
  const { data: itemCount } = useCartCount();

  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const getProductImage = (watchImages: any[]): string => {
    if (!watchImages || watchImages.length === 0) return "/placeholder-watch.jpg";
    const images = watchImages[0];
    return images.front || images.isoview || "/placeholder-watch.jpg";
  };

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await updateCartItem.mutateAsync({ cartItemId, data: { quantity: newQuantity } });
    } catch (error) {
      showToast("Failed to update quantity", "error");
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (cartItemId: string, itemName: string) => {
    try {
      await removeFromCart.mutateAsync(cartItemId);
      showToast(`${itemName} removed from cart`, "success");
    } catch (error) {
      showToast("Failed to remove item", "error");
    }
  };

  const handleCheckout = () => {
    if (!profile?.email) {
      setIsVerificationModalOpen(true);
    } else {
      window.location.href = '/checkout';
    }
  };

  const handleVerificationSuccess = () => {
    setIsVerificationModalOpen(false);
    showToast("Email verified successfully!", "success");
    window.location.href = '/checkout';
  };

  if (authLoading || cartLoading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading Cart...</span>
      </div>
    );
  }

  if (cartError || !cartData) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Error loading cart</h2>
          <p className="text-gray-400">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  // Handle empty cart states
  if (cartData.items.length === 0) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Your Shopping Bag is Empty</h1>
          {!profile ? (
            <>
              <p className="text-gray-400 mb-8">Sign in to see your cart and start shopping.</p>
              <div className="space-y-4">
                <Link href="/collections" className={styles['custom-button']}>
                  Continue Shopping
                </Link>
                <button className={styles['secondary-button']} onClick={() => window.location.href = '/'}>
                  Sign In
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-400 mb-8">Add some amazing watches to get started.</p>
              <Link href="/collections" className={styles['custom-button']}>
                Continue Shopping
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const { items } = cartData;
  const subtotal = totalData?.subtotal || 0;
  const deliveryFee = 0; // Assuming free delivery
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-black text-white min-h-screen pt-24 pb-12">
      <EmailVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSuccess={handleVerificationSuccess}
      />
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">SHOPPING BAG</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {items.map(item => {
              const watch = item.watchColor?.Watch;
              if (!watch) return null;
              const isUpdating = updatingItems.has(item.id);

              return (
                <div key={item.id} className="flex gap-6">
                  <div className="w-32 h-40 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={getProductImage(watch.WatchImages)}
                      alt={watch.name}
                      width={128}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h2 className="font-bold text-xl">{watch.name}</h2>
                      <p className="text-base text-gray-400">Art. no. {watch.id.substring(0, 8)}</p>
                      <p className="text-base text-gray-400">Color: {item.watchColor.name}</p>
                      <p className="text-base text-gray-400">Unit Price: ₹{parseFloat(item.price_at_time).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border border-gray-600 rounded-md">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-2 disabled:opacity-50"
                          disabled={isUpdating || item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 font-bold text-base">
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : item.quantity}
                        </span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-2 disabled:opacity-50"
                          disabled={isUpdating}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button onClick={() => handleRemoveItem(item.id, watch.name)} className="text-gray-400 hover:text-white">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl">₹{(parseFloat(item.price_at_time) * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className={`${styles.glassmorphic} rounded-lg p-6`}>
              <h2 className="font-bold text-2xl mb-4">Order Summary</h2>
              <div className="space-y-3 text-base">
                <div className="flex justify-between">
                  <span>Order value</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{deliveryFee > 0 ? `₹${deliveryFee.toLocaleString()}` : 'Free'}</span>
                </div>
                <div className="border-t border-gray-600 my-4"></div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-6">
                <button onClick={handleCheckout} className={styles['custom-button']}>
                  Continue to Checkout
                </button>
              </div>
              {/* Only show Sign In button if user is not authenticated */}
              {!profile && (
                <div className="mt-4">
                  <button className={styles['secondary-button']} onClick={() => window.location.href = '/'}>
                    Sign In
                  </button>
                </div>
              )}
              <div className="text-sm text-gray-400 mt-4 space-y-2">
                <p>Prices and delivery costs are not confirmed until you've reached the checkout.</p>
                <p>15 days free returns. Read more about <Link href="/returns" className="underline">returns and refund policy</Link>.</p>
                <p>Customer would receive an SMS from our delivery partners regarding delivery of order(s) on the registered phone number.</p>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-3">We accept:</p>
                <PaymentIcons size="small" />
              </div>
              <div className="flex items-center gap-4 mt-4">
                <Shield size={24} className="text-green-400" />
                <span className="text-sm text-gray-400">Secure payments powered by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;