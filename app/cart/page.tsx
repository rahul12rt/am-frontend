// collection/cart/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useCreateOrder, useVerifyPayment } from "../../hooks/usePayment";

interface WatchImage {
  id: string;
  watch_id: string;
  isoview: string;
  front: string;
  back: string;
  side: string;
  strap: string;
  closeup: string;
  dial: string;
  createdat: string;
  updatedat: string;
}

interface Watch {
  id: string;
  name: string;
  description: string;
  characteristics: string;
  actualprice: string;
  offerprice: string;
  offerpercentage: string;
  rating: number;
  reviewscount: number;
  category: string;
  series: string;
  modelgroup: string;
  releasedate: string;
  theme: string;
  warrantyperiod: string;
  stockavailability: boolean;
  isfeatured: boolean;
  createdat: string;
  updatedat: string;
  WatchImages: WatchImage[];
}

interface CartItem {
  id: string;
  user_id: string;
  watch_id: string;
  quantity: number;
  price_at_time: string;
  createdat: string;
  updatedat: string;
  Watch: Watch;
}

interface CartSummary {
  totalItems: number;
  totalAmount: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    items: CartItem[];
    summary: CartSummary;
  };
}

const CartPage: React.FC = () => {
  // Static API response data
  const apiResponse: ApiResponse = {
    success: true,
    data: {
      items: [
        {
          id: "70b3e275-7566-45e6-8339-ad80045d1116",
          user_id: "6c333b09-5851-4fdb-b103-21420230493b",
          watch_id: "1112a3f1-b199-46b0-b6e0-ad9adb304711",
          quantity: 1,
          price_at_time: "7650.00",
          createdat: "2025-07-23T18:37:29.964Z",
          updatedat: "2025-07-23T18:37:29.964Z",
          Watch: {
            id: "1112a3f1-b199-46b0-b6e0-ad9adb304711",
            name: "Rolex Submariner Date",
            description:
              "Professional diving watch with date display and unidirectional rotating bezel",
            characteristics:
              "Water-resistant to 300m, Automatic movement, Ceramic bezel, Luminous hands",
            actualprice: "8500.00",
            offerprice: "7650.00",
            offerpercentage: "10%",
            rating: 4.8,
            reviewscount: 127,
            category: "Luxury",
            series: "Submariner",
            modelgroup: "Professional",
            releasedate: "2023-01-15T12:00:00.000Z",
            theme: "Sport",
            warrantyperiod: "24",
            stockavailability: true,
            isfeatured: true,
            createdat: "2025-07-23T15:15:52.616Z",
            updatedat: "2025-07-23T15:15:52.616Z",
            WatchImages: [
              {
                id: "28f59feb-1c3a-4fee-b384-78cdc01cbf82",
                watch_id: "1112a3f1-b199-46b0-b6e0-ad9adb304711",
                isoview:
                  "https://alban.b-cdn.net/watches/1112a3f1-b199-46b0-b6e0-ad9adb304711_isoview_1753283754713_Watch.jpg",
                front:
                  "https://alban.b-cdn.net/watches/1112a3f1-b199-46b0-b6e0-ad9adb304711_front_1753283754713_Watch.jpg",
                back: "https://alban.b-cdn.net/watches/1112a3f1-b199-46b0-b6e0-ad9adb304711_back_1753283754713_Watch.jpg",
                side: "https://alban.b-cdn.net/watches/1112a3f1-b199-46b0-b6e0-ad9adb304711_side_1753283754713_Watch.jpg",
                strap:
                  "https://alban.b-cdn.net/watches/1112a3f1-b199-46b0-b6e0-ad9adb304711_strap_1753283754713_Watch.jpg",
                closeup:
                  "https://alban.b-cdn.net/watches/1112a3f1-b199-46b0-b6e0-ad9adb304711_closeup_1753283754713_Watch.jpg",
                dial: "https://alban.b-cdn.net/watches/1112a3f1-b199-46b0-b6e0-ad9adb304711_dial_1753283754713_Watch.jpg",
                createdat: "2025-07-23T15:15:57.557Z",
                updatedat: "2025-07-23T15:15:57.557Z",
              },
            ],
          },
        },
      ],
      summary: {
        totalItems: 1,
        totalAmount: "7650.00",
      },
    },
  };

  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();

  const [cartItems, setCartItems] = useState<CartItem[]>(
    apiResponse.data.items
  );
  const [couponCode, setCouponCode] = useState<string>("");
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

  // Add payment processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Razorpay script loader
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const proceedToCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    try {
      setIsProcessingPayment(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay script failed to load");
      }

      // Verify Razorpay is available
      if (!window.Razorpay) {
        throw new Error("Razorpay is not available on window object");
      }

      // Create order with the total amount
      const orderResponse = await createOrderMutation.mutateAsync({
        amount: total,
        currency: "INR",
        receipt: `cart_${Date.now()}`,
      });

      if (!orderResponse.success) {
        throw new Error("Failed to create payment order");
      }

      const { order_id, key_id, amount: orderAmount } = orderResponse;

      // Verify all required fields
      if (!order_id || !key_id || !orderAmount) {
        throw new Error("Missing required order details");
      }

      // Prepare cart items summary for description
      const itemsSummary =
        cartItems.length === 1
          ? cartItems[0].Watch.name
          : `${cartItems.length} watches`;

      // Razorpay checkout options
      const options = {
        key: key_id,
        amount: orderAmount,
        currency: "INR",
        name: "Alban Marcus",
        description: `Purchase: ${itemsSummary}`,
        order_id: order_id,
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#000000",
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verificationResponse =
              await verifyPaymentMutation.mutateAsync({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

            if (verificationResponse.success) {
              // Payment successful
              alert("Payment successful! Thank you for your purchase.");
              setCartItems([]);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed! Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
      };

      // Create and open Razorpay instance
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      const errorMessage = error?.message || "Unknown error occurred";
      alert(`Failed to initiate payment: ${errorMessage}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Function to get the best available image from API response
  const getProductImage = (watch: Watch): string => {
    const images = watch.WatchImages[0];
    if (!images) return "/placeholder-watch.jpg";

    // Priority order: front -> isoview -> closeup -> dial -> any other
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
  const handleImageError = (watchId: string) => {
    setImageError((prev) => ({ ...prev, [watchId]: true }));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const calculateSubtotal = (): number => {
    return cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price_at_time) * item.quantity,
      0
    );
  };

  const subtotal = calculateSubtotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      alert("Please enter a coupon code");
      return;
    }
    console.log("Applying coupon:", couponCode);
    // Handle coupon application logic here
  };

  const returnToShop = () => {
    console.log("Returning to shop");
    window.location.href = "/collection";
  };

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <section className="pt-[90px] pb-[70px] bg-black-1 text-white-1 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <p className="flex items-center text-[16px] pb-[40px] gap-2">
            <Link href="/" className="opacity-60 hover:opacity-100">
              Home
            </Link>
            <MdKeyboardArrowRight />
            <Link href="/collection" className="opacity-60 hover:opacity-100">
              Collection
            </Link>
            <MdKeyboardArrowRight />
            <span>Cart</span>
          </p>

          <div className="bg-white rounded-lg shadow-sm text-black overflow-hidden">
            <div className="text-center py-16 px-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any watches to your cart yet.
              </p>
              <button
                onClick={returnToShop}
                className="px-8 py-3 bg-black text-white rounded font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-[90px] pb-[70px] bg-black-1 text-white-1 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Breadcrumb - matching your colleague's style */}
        <p className="flex items-center text-[16px] pb-[40px] gap-2">
          <Link href="/" className="opacity-60 hover:opacity-100">
            Home
          </Link>
          <MdKeyboardArrowRight />
          <Link href="/collection" className="opacity-60 hover:opacity-100">
            Collection
          </Link>
          <MdKeyboardArrowRight />
          <span>Cart</span>
        </p>

        <div className="bg-white rounded-lg shadow-sm text-black overflow-hidden">
          {/* Header - only show on sm+ */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 font-medium text-gray-700 bg-gray-50 text-[16px] ">
            <div>Product</div>
            <div className="text-center">Price</div>
            <div className="text-center">Quantity</div>
            <div className="text-center">Subtotal</div>
          </div>

          {/* Cart Items */}
          <div className="bg-white divide-y divide-gray-100">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 py-6 items-center"
              >
                {/* Product */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 relative mx-auto sm:mx-0">
                    {!imageError[item.Watch.id] ? (
                      <Image
                        src={getProductImage(item.Watch)}
                        alt={item.Watch.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                        onError={() => handleImageError(item.Watch.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <h3 className="font-semibold text-white text-[14px]  mb-1 leading-tight">
                      {item.Watch.name}
                    </h3>
                    <p className="text-[14px]  text-white line-clamp-2 leading-relaxed">
                      {item.Watch.description}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center mt-4 sm:mt-0">
                  {parseFloat(item.Watch.actualprice) >
                    parseFloat(item.Watch.offerprice) && (
                    <div className="text-[16px] text-gray-400 line-through mb-1">
                      ${parseFloat(item.Watch.actualprice).toLocaleString()}
                    </div>
                  )}
                  <div
                    className={`font-semibold text-[16px]  ${
                      parseFloat(item.Watch.actualprice) >
                      parseFloat(item.Watch.offerprice)
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    ${parseFloat(item.price_at_time).toLocaleString()}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex justify-center mt-4 sm:mt-0">
                  <div className="relative">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 0) {
                          updateQuantity(item.id, value);
                        }
                      }}
                      className="w-20 h-10 text-center border border-gray-300 rounded text-[16px]  font-medium text-gray-900 focus:outline-none focus:border-blue-500 pr-4"
                      min="0"
                      max="99"
                    />
                    {/* Arrows stay */}
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-center font-semibold text-[16px]  text-white mt-4 sm:mt-0">
                  $
                  {(
                    parseFloat(item.price_at_time) * item.quantity
                  ).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="px-8 py-8 border-t-2 border-gray-200 bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              {/* Coupon Section */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded text-[16px]  focus:outline-none focus:border-blue-500"
                  maxLength={20}
                />
                {/* FIXED APPLY COUPON BUTTON - SIMPLE BLACK BACKGROUND */}
                <button
                  onClick={applyCoupon}
                  className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded text-[16px]  font-medium disabled:opacity-50"
                  disabled={!couponCode.trim()}
                >
                  Apply Coupon
                </button>
              </div>

              {/* Cart Total - NO TAX OPTION */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 min-w-[300px] flex-shrink-0">
                <h3 className="text-[20px] font-semibold mb-4 text-gray-900">
                  Cart Total
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-[16px]">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-[16px]">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>

                  {/* Tax option removed as requested */}

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-[18px] font-semibold text-gray-900">
                      <span>Total:</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={proceedToCheckout}
                  disabled={
                    isProcessingPayment ||
                    createOrderMutation.isPending ||
                    verifyPaymentMutation.isPending
                  }
                  className="w-full mt-6 px-6 py-3 !bg-[#000000] !text-[#ffffff] !border-none rounded text-[16px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ||
                  createOrderMutation.isPending ||
                  verifyPaymentMutation.isPending
                    ? "Processing..."
                    : `Proceed to checkout - $${total.toLocaleString()}`}
                </button>
              </div>
            </div>

            {/* Return to Shop Button */}
            <div className="mt-6">
              <button
                onClick={returnToShop}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium text-[16px]"
              >
                Return To Shop
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
