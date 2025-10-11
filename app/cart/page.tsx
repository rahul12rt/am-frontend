"use client";

import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, Loader2, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/queries/useUser';
import { useToast } from '@/contexts/ToastContext';
import { useUserModal } from '@/contexts/UserModalContext';
import PaymentIcons from '@/components/atoms/PaymentIcons';
import EmailVerificationModal from '@/components/organisms/checkout/EmailVerificationModal';
import {
  useCart, 
  useUpdateCartItem, 
  useRemoveFromCart, 
  useCartTotal, 
  useCartCount,
  useClearCart
} from "@/hooks/queries/useCart";
import { trackViewCart, trackRemoveFromCart, trackBeginCheckout, formatCartItemToGAItem } from '@/components/seo/GoogleAnalytics';

const CartPage: React.FC = () => {
  const { user, profile, isAuthenticated, isLoading, loading } = useAuth();
  const { showToast } = useToast();
  const { openModal } = useUserModal();
  const router = useRouter();

  // Store redirect path for login
  useEffect(() => {
    if (!isLoading && !profile) {
      sessionStorage.setItem('redirectAfterLogin', '/cart');
    }
  }, [isLoading, profile]);

  // Only fetch cart data if user is authenticated
  const shouldFetchCart = isAuthenticated && !isLoading;
  const { data: cartData, isLoading: cartLoading, isFetching: cartFetching, error: cartError } = useCart(isAuthenticated);

  // Clear items awaiting refetch when cart data is updated
  useEffect(() => {
    if (!cartFetching && cartData) {
      // Clear all items awaiting refetch when cart data is fresh
      setItemsAwaitingRefetch(new Set());
    }
  }, [cartFetching, cartData]);

  // Track view_cart event when cart loads
  useEffect(() => {
    if (cartData && cartData.items && cartData.items.length > 0) {
      const cartValue = cartData.items.reduce((total, item) => {
        const itemPrice = parseFloat(item.watchColor?.offerprice || item.watchColor?.Watch?.offerprice || '0');
        return total + (itemPrice * item.quantity);
      }, 0);
      
      const items = cartData.items.map((item, index) => formatCartItemToGAItem(item, index));
      trackViewCart('INR', cartValue, items);
    }
  }, [cartData]);
  
  const { data: totalData } = useCartTotal(isAuthenticated, profile);
  const { data: itemCount } = useCartCount(isAuthenticated);

  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [itemsAwaitingRefetch, setItemsAwaitingRefetch] = useState<Set<string>>(new Set());

  // Check if any cart operations are in progress
  const isCartOperationInProgress = 
    updateCartItem.isPending || 
    removeFromCart.isPending || 
    clearCart.isPending || 
    isClearingCart ||
    updatingItems.size > 0 ||
    cartLoading ||
    cartFetching; // Include background refetches after mutations

  const getProductImage = (imageURL: string): string => {
    return imageURL || "/images/alban-marcus-watch.png";
  };

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await updateCartItem.mutateAsync({ cartItemId, data: { quantity: newQuantity } });
      // Mark item as awaiting refetch to show loading during cart data update
      setItemsAwaitingRefetch(prev => new Set(prev).add(cartItemId));
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
    // Find the item to track before removing
    const itemToRemove = cartData?.items.find(item => item.id === cartItemId);
    
    try {
      await removeFromCart.mutateAsync(cartItemId);
      
      // Track remove_from_cart event
      if (itemToRemove) {
        const itemPrice = parseFloat(itemToRemove.watchColor?.offerprice || itemToRemove.watchColor?.Watch?.offerprice || '0');
        trackRemoveFromCart('INR', itemPrice * itemToRemove.quantity, [
          formatCartItemToGAItem(itemToRemove)
        ]);
      }
      
      // Mark item as awaiting refetch to show loading during cart data update
      setItemsAwaitingRefetch(prev => new Set(prev).add(cartItemId));
      showToast(`${itemName} removed from cart`, "success");
    } catch (error) {
      showToast("Failed to remove item", "error");
    }
  };

  const handleClearCart = async () => {
    setIsClearingCart(true);
    try {
      await clearCart.mutateAsync();
      showToast("Cart cleared successfully", "success");
    } catch (error) {
      showToast("Failed to clear cart", "error");
    } finally {
      setIsClearingCart(false);
    }
  };

  const handleCheckout = () => {
    // Prevent checkout during cart operations
    if (isCartOperationInProgress) {
      showToast("Please wait for cart updates to complete", "info");
      return;
    }

    // Check if cart has items
    if (!cartData?.items?.length) {
      showToast("Your cart is empty", "error");
      return;
    }

    // Track begin_checkout event
    const cartValue = cartData.items.reduce((total, item) => {
      const itemPrice = parseFloat(item.watchColor?.offerprice || item.watchColor?.Watch?.offerprice || '0');
      return total + (itemPrice * item.quantity);
    }, 0);
    
    const items = cartData.items.map((item, index) => formatCartItemToGAItem(item, index));
    trackBeginCheckout('INR', cartValue, items);

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

  // Show loading only when auth is loading or cart is loading for authenticated users
  if (isLoading || (shouldFetchCart && cartLoading)) {
    return (
      <div className="pt-[90px] pb-[70px] bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="container">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="inline-flex items-center space-x-3">
              <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
              <span className="text-lg font-medium text-gray-900">
                {isLoading ? "Loading..." : "Loading your cart..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show cart error only for authenticated users
  if (shouldFetchCart && (cartError || !cartData)) {
    return (
      <div className="pt-[90px] pb-[70px] bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="container">
          <div className="text-center min-h-[400px] flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Pleaase Log in to see your cart</h2>
              <p className="text-gray-600 mb-6">Please try refreshing the page.</p>
              <Link href="/collections" className="bg-gray-900 text-white px-6 py-5 rounded-lg hover:bg-gray-800 transition-colors inline-block">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty cart states
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="pt-[90px] pb-[70px] bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="container">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              {!profile ? (
                <>
                  <h1 className="font-bold mb-2 text-gray-900" style={{ fontSize: '2.2rem' }}>You Must Be Logged In</h1>
                  <p className="text-gray-600 mb-8" style={{ fontSize: '1.5rem' }}>Sign in to see your cart and start shopping.</p>
                  <div className="space-y-4">
                    <button 
                      onClick={openModal}
                      className="block w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors" 
                      style={{ fontSize: '1.5rem' }}
                    >
                      Sign In
                    </button>
                    <Link href="/collections" className="block w-full py-4 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors" style={{ fontSize: '1.5rem' }}>
                      Continue Shopping
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="font-bold mb-2 text-gray-900" style={{ fontSize: '2.2rem' }}>Your Shopping Bag is Empty</h1>
                  <p className="text-gray-600 mb-8" style={{ fontSize: '1.5rem' }}>Looks like you haven't added anything to your cart yet.</p>
                  <Link href="/collections" className="block w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors" style={{ fontSize: '1.5rem' }}>
                    Start Shopping
                  </Link>
                </>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { items } = cartData;
  
  // Calculate subtotal from cart data directly as fallback
  const cartSubtotal = cartData?.summary?.totalAmount ? parseFloat(cartData.summary.totalAmount) : 0;
  const calculatedSubtotal = items?.reduce((total, item) => {
    // Try multiple possible price fields
    let itemPrice = 0;
    if (item.watchColor?.Watch) {
      itemPrice = parseFloat(item.watchColor.Watch.offerprice?.toString() || '0');
    } else if ((item as any).price) {
      itemPrice = parseFloat((item as any).price.toString());
    } else if ((item.watchColor as any)?.price) {
      itemPrice = parseFloat((item.watchColor as any).price.toString());
    }
    
    // Item price calculation
    
    return total + (itemPrice * item.quantity);
  }, 0) || 0;
  
  // Use the higher of the two calculations or fallback to cart summary
  const subtotal = totalData?.subtotal || calculatedSubtotal || cartSubtotal || 0;
  const deliveryFee = 0; // Assuming free delivery
  const discountAmount = totalData?.discountAmount || (profile?.eligibleForDiscount ? subtotal * 0.1 : 0);
  const finalTotal = totalData?.finalTotal || (subtotal - discountAmount);
  const isEligibleForDiscount = totalData?.eligibleForDiscount || profile?.eligibleForDiscount || false;
  
  // Debug logging
  console.log('Cart Page Debug:', {
    cartData: cartData,
    items: items,
    cartSubtotal,
    calculatedSubtotal,
    totalDataSubtotal: totalData?.subtotal,
    finalSubtotal: subtotal,
    discountAmount,
    finalTotal,
    isEligibleForDiscount,
    profile: profile?.eligibleForDiscount,
    totalData: totalData
  });

  return (
    <div className="pt-[90px] pb-[70px] bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <EmailVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSuccess={handleVerificationSuccess}
      />
      <div className="container">
        {/* Breadcrumb */}
        <div className="flex items-center pb-[40px] gap-2 text-gray-700" style={{ fontSize: '1.5rem' }}>
          <Link href="/" className="opacity-60 hover:opacity-100 hover:text-black transition-colors">
            Home
          </Link>
          <MdKeyboardArrowRight className="text-gray-400" />
          <span className="font-medium text-black">Shopping Cart</span>
        </div>

        {/* Header with Clear Cart */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-bold text-gray-900 text-[2.2rem] max-[768px]:text-[1.6rem]">Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</h1>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              disabled={isClearingCart}
              className="text-[1.5rem] max-[768px]:text-[1.4rem] flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {isClearingCart ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Trash2 className="w-6 h-6" />
              )}
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="space-y-0">
                {items.map((item: any, index: number) => {
                  const isUpdating = updatingItems.has(item.id);
                  const isAwaitingRefetch = itemsAwaitingRefetch.has(item.id);
                  const isItemLoading = isUpdating || isAwaitingRefetch;

                  return (
                    <div key={item.id} className={`p-6 ${index !== items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <div className="flex gap-6 flex-wrap">
                        {/* Watch Image */}
                        <div className="w-40 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-200">
                          <Image
                            src={getProductImage(item.imageURL)}
                            alt={item.name}
                            width={160}
                            height={192}
                            className="w-full h-full object-contain p-4"
                            onError={(e) => {
                              e.currentTarget.src = '/images/alban-marcus-watch.png';
                            }}
                          />
                        </div>

                        {/* Watch Details */}
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <h2 className="font-bold text-gray-900 mb-2" style={{ fontSize: '2.2rem' }}>{item.name}</h2>
                            <p className="text-gray-600 mb-1" style={{ fontSize: '1.5rem' }}>Category: {item.category}</p>
                            <p className="text-gray-600 mb-1" style={{ fontSize: '1.5rem' }}>Model Group: {item.modelGroup}</p>
                            <p className="text-gray-600 mb-1" style={{ fontSize: '1.5rem' }}>Variant: {item.color}</p>
                            <p className="text-gray-600 mb-3" style={{ fontSize: '1.5rem' }}>Unit Price: ₹{parseFloat(item.price).toLocaleString()}</p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button 
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  disabled={isItemLoading || item.quantity <= 1}
                                >
                                  <Minus size={16} className="text-gray-600" />
                                </button>
                                <span className="px-4 py-2 font-bold text-gray-900 min-w-[3rem] text-center" style={{ fontSize: '1.5rem' }}>
                                  {isItemLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                  ) : (
                                    item.quantity
                                  )}
                                </span>
                                <button 
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  disabled={isItemLoading}
                                >
                                  <Plus size={20} className="text-gray-600" />
                                </button>
                              </div>

                              <button 
                                onClick={() => handleRemoveItem(item.id, item.name)} 
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove item"
                              >
                                <Trash2 size={22} />
                              </button>
                            </div>

                            {/* Line Total */}
                            <div className="text-right">
                              <p className="font-bold text-gray-900" style={{ fontSize: '2.2rem' }}>
                                ₹{parseFloat(item.inlinePrice).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <h2 className="font-bold text-gray-900 mb-6" style={{ fontSize: '2.2rem' }}>Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontSize: '1.5rem' }}>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium text-gray-900" style={{ fontSize: '1.5rem' }}>₹{subtotal.toLocaleString()}</span>
                </div>
                
                {/* Discount Section with Animation */}
                {isEligibleForDiscount && (
                  <div className="animate-pulse bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 transform transition-all duration-500 hover:scale-105">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-green-700 font-semibold" style={{ fontSize: '1.5rem' }}>🎉 Special Discount (10%)</span>
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                          APPLIED
                        </span>
                      </div>
                      <span className="font-bold text-green-700" style={{ fontSize: '1.5rem' }}>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">You're saving ₹{discountAmount.toLocaleString()} on this order!</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontSize: '1.5rem' }}>Shipping</span>
                  <span className="font-medium text-green-600" style={{ fontSize: '1.5rem' }}>Free</span>
                </div>
                <div className="border-t border-gray-200 my-4"></div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900" style={{ fontSize: '2.2rem' }}>Total</span>
                  <div className="text-right">
                    {isEligibleForDiscount && discountAmount > 0 && (
                      <div className="text-gray-500 line-through text-sm">₹{subtotal.toLocaleString()}</div>
                    )}
                    <span className="font-bold text-gray-900" style={{ fontSize: '2.2rem' }}>₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-6">
                <button 
                  onClick={handleCheckout} 
                  disabled={isCartOperationInProgress || !cartData?.items?.length}
                  className={`w-full py-4 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isCartOperationInProgress || !cartData?.items?.length
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  style={{ fontSize: '1.5rem' }}
                >
                  {isCartOperationInProgress ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating Cart...
                    </>
                  ) : (
                    'Continue to Checkout'
                  )}
                </button>
              </div>

              {/* Sign In Button for non-authenticated users */}
              {!profile && (
                <div className="mt-4">
                  <button 
                    className="w-full py-4 border border-gray-900 text-gray-900 font-medium rounded-lg transition-colors hover:bg-gray-200"
                    onClick={openModal}
                    style={{ fontSize: '1.5rem' }}
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Additional Info */}
              <div className="mt-6 space-y-3">
                <p className="text-gray-600" style={{ fontSize: '1.5rem' }}>
                  Prices and delivery costs are not confirmed until you've reached the checkout.
                </p>
                <p className="text-gray-600" style={{ fontSize: '1.5rem' }}>
                  7 days free returns. Read more about{' '}
                  <Link href="/returns" target="_blank" className="text-gray-900 underline hover:text-gray-700">
                    returns and exchange policy
                  </Link>{' '}
                  and{' '}
                  <Link href="/warranty" target="_blank" className="text-gray-900 underline hover:text-gray-700">
                    warranty
                  </Link>.
                </p>
              </div>

              {/* Payment Icons */}
              <div className="mt-6">
                <PaymentIcons size="small" />
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-3 mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
                <Shield size={24} className="text-green-600" />
                <span className="text-green-700 font-medium" style={{ fontSize: '1.5rem' }}>
                  Secure payments powered by Razorpay
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;