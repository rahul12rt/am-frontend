"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import { Minus, Plus, Trash2, ShoppingBag, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useCartTotal,
  useCartCount,
} from "@/hooks/queries/useCart";

const CartPage: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Cart hooks
  const { data: cartData, isLoading: cartLoading, error: cartError } = useCart();
  const { data: totalData } = useCartTotal();
  const { data: itemCount } = useCartCount();

  // Mutation hooks
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  // Local state
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Helper function to get the best available image
  const getProductImage = (watchImages: any[]): string => {
    if (!watchImages || watchImages.length === 0) return "/placeholder-watch.jpg";

    const images = watchImages[0];
    return (
      images.front ||
      images.isoview ||
      images.closeup ||
      images.dial ||
      images.side ||
      images.back ||
      images.strap ||
      "/placeholder-watch.jpg"
    );
  };

  // Handle image error
  const handleImageError = (itemId: string) => {
    setImageError((prev) => ({ ...prev, [itemId]: true }));
  };

  // Handle quantity update
  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return;

    setUpdatingItems(prev => new Set(prev).add(cartItemId));

    try {
      await updateCartItem.mutateAsync({
        cartItemId,
        data: { quantity: newQuantity }
      });
      showToast("Quantity updated successfully", "success");
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

  // Handle item removal
  const handleRemoveItem = async (cartItemId: string, itemName: string) => {
    try {
      await removeFromCart.mutateAsync(cartItemId);
      showToast(`${itemName} removed from cart`, "success");
    } catch (error) {
      showToast("Failed to remove item", "error");
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (!cartData?.items || cartData.items.length === 0) return;

    const confirmed = window.confirm("Are you sure you want to remove all items from your cart?");
    if (!confirmed) return;

    try {
      await clearCart.mutateAsync();
      showToast("Cart cleared successfully", "success");
    } catch (error) {
      showToast("Failed to clear cart", "error");
    }
  };

  // Navigate to checkout
  const handleCheckout = () => {
    if (!cartData?.items || cartData.items.length === 0) {
      showToast("Your cart is empty", "info");
      return;
    }

    // TODO: Navigate to checkout page
    showToast("Checkout functionality coming soon!", "info");
  };

  // Loading state
  if (authLoading || cartLoading) {
    return (
      <section className="pt-[90px] pb-[70px] bg-black min-h-screen">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
              <p className="text-white text-lg">Loading your cart...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (cartError) {
    return (
      <section className="pt-[90px] pb-[70px] bg-black min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Error Loading Cart
            </h2>
            <p className="text-gray-400 mb-8">
              We couldn't load your cart. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Check if user is authenticated
  if (!profile) {
    return (
      <section className="pt-[90px] pb-[70px] bg-black min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Please Sign In
            </h2>
            <p className="text-gray-400 mb-8">
              You need to be signed in to view your cart.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Empty cart state
  if (!cartData?.items || cartData.items.length === 0) {
    return (
      <section className="pt-[90px] pb-[70px] bg-black text-white min-h-screen">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <p className="flex items-center text-[16px] pb-[40px] gap-2">
            <Link href="/" className="opacity-60 hover:opacity-100 transition-opacity">
              Home
            </Link>
            <MdKeyboardArrowRight />
            <Link href="/collection" className="opacity-60 hover:opacity-100 transition-opacity">
              Collection
            </Link>
            <MdKeyboardArrowRight />
            <span>Cart</span>
          </p>

          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
            <div className="text-center py-16 px-8">
              <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4 text-white">
                Your Cart is Empty
              </h2>
              <p className="text-gray-400 mb-8">
                Looks like you haven't added any watches to your cart yet.
                Explore our luxury collection and find your perfect timepiece.
              </p>
              <Link
                href="/collection"
                className="inline-flex items-center px-8 py-4 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const cartItems = cartData.items;
  const subtotal = totalData?.subtotal || 0;
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <section className="pt-[90px] pb-[70px] bg-black text-white min-h-screen">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <p className="flex items-center text-[16px] pb-[40px] gap-2">
          <Link href="/" className="opacity-60 hover:opacity-100 transition-opacity">
            Home
          </Link>
          <MdKeyboardArrowRight />
          <Link href="/collection" className="opacity-60 hover:opacity-100 transition-opacity">
            Collection
          </Link>
          <MdKeyboardArrowRight />
          <span>Cart</span>
        </p>

        {/* Cart Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Shopping Cart</h1>
            <p className="text-gray-400">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          {cartItems.length > 1 && (
            <button
              onClick={handleClearCart}
              disabled={clearCart.isPending}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
            >
              {clearCart.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const watch = item.watchColor?.Watch;
              const isUpdating = updatingItems.has(item.id);

              if (!watch) return null;

              return (
                <div
                  key={item.id}
                  className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-6 items-center">
                    {/* Product Image */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0 relative">
                          {!imageError[item.id] ? (
                            <Image
                              src={getProductImage(watch.WatchImages)}
                              alt={watch.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                              onError={() => handleImageError(item.id)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center p-2">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2">
                            {watch.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-2">
                            Color: {item.watchColor.name}
                          </p>
                          <div className="flex items-center gap-2">
                            {parseFloat(watch.actualprice.toString()) > parseFloat(watch.offerprice.toString()) && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{parseFloat(watch.actualprice.toString()).toLocaleString()}
                              </span>
                            )}
                            <span className="text-lg font-semibold text-white">
                              ₹{parseFloat(watch.offerprice.toString()).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                          className="w-10 h-10 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <div className="flex items-center justify-center min-w-[60px]">
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <span className="text-xl font-semibold text-white">{item.quantity}</span>
                          )}
                        </div>

                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 99 || isUpdating}
                          className="w-10 h-10 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <div className="text-right">
                          <p className="text-xl font-bold text-white">
                            ₹{(parseFloat(item.price_at_time) * item.quantity).toLocaleString()}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-gray-400">
                              ₹{parseFloat(item.price_at_time).toLocaleString()} each
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id, watch.name)}
                          disabled={removeFromCart.isPending}
                          className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-all disabled:opacity-50"
                        >
                          {removeFromCart.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-800 p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-6 text-white">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-base">
                  <span className="text-gray-400">Subtotal ({itemCount} items):</span>
                  <span className="text-white font-medium">₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-base">
                  <span className="text-gray-400">Shipping:</span>
                  <span className="text-green-400 font-medium">Free</span>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white">Total:</span>
                    <span className="text-white">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-white text-black font-semibold py-4 px-6 rounded-lg hover:bg-gray-100 transition-colors mb-4"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/collection"
                className="block text-center text-gray-400 hover:text-white transition-colors text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;