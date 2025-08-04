// collection/cart/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";

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

  const [cartItems, setCartItems] = useState<CartItem[]>(
    apiResponse.data.items
  );
  const [couponCode, setCouponCode] = useState<string>("");
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

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

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    console.log("Proceeding to checkout with items:", cartItems);
    // Handle checkout logic here
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
          <p className="flex items-center text-[14px] pb-[40px] gap-2">
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
        <p className="flex items-center text-[14px] pb-[40px] gap-2">
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
          {/* Header - Fixed column alignment with proper spacing */}
          <div className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-8 px-8 py-6 border-b border-gray-200 font-medium text-gray-700 bg-gray-50">
            <div>Product</div>
            <div className="text-center">Price</div>
            <div className="text-center">Quantity</div>
            <div className="text-center">Subtotal</div>
          </div>

          {/* Cart Items - NO HOVER EFFECT */}
          <div className="bg-white">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-8 px-8 py-6 items-center border-b border-gray-100 last:border-b-0 bg-white"
              >
                {/* Product */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 relative">
                    {!imageError[item.Watch.id] ? (
                      <Image
                        src={getProductImage(item.Watch)}
                        alt={item.Watch.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={() => handleImageError(item.Watch.id)}
                        priority={false}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-base mb-1 leading-tight">
                      {item.Watch.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {item.Watch.description}
                    </p>
                  </div>
                </div>

                {/* Price - Centered */}
                <div className="flex flex-col items-center justify-center">
                  {parseFloat(item.Watch.actualprice) >
                    parseFloat(item.Watch.offerprice) && (
                    <div className="text-sm text-gray-400 line-through mb-1">
                      ${parseFloat(item.Watch.actualprice).toLocaleString()}
                    </div>
                  )}
                  <div
                    className={`font-semibold text-base ${
                      parseFloat(item.Watch.actualprice) >
                      parseFloat(item.Watch.offerprice)
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    ${parseFloat(item.price_at_time).toLocaleString()}
                  </div>
                </div>

                {/* Quantity - FIXED TO MATCH DESIGN WITH UP/DOWN ARROWS */}
                <div className="flex justify-center">
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
                      className="w-16 h-8 text-center border border-gray-300 rounded text-sm font-medium text-gray-900 focus:outline-none focus:border-blue-500 pr-4"
                      min="0"
                      max="99"
                    />
                    <div className="absolute right-1 top-0 h-full flex flex-col">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="flex-1 w-3 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800 leading-none"
                        title="Increase quantity"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="flex-1 w-3 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800 leading-none disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={item.quantity <= 1}
                        title="Decrease quantity"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtotal - Centered */}
                <div className="flex justify-center items-center font-semibold text-base text-gray-900">
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
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
              {/* Coupon Section */}
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="px-4 py-3 border border-gray-300 rounded text-sm min-w-[200px] flex-1 max-w-[300px] focus:outline-none focus:border-blue-500"
                  maxLength={20}
                />
                {/* FIXED APPLY COUPON BUTTON - SIMPLE BLACK BACKGROUND */}
                <button
                  onClick={applyCoupon}
                  className="px-6 py-3 bg-[#000000] !text-[#ffffff] !border-none rounded text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                  disabled={!couponCode.trim()}
                >
                  Apply Coupon
                </button>
              </div>

              {/* Cart Total - NO TAX OPTION */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 min-w-[300px] flex-shrink-0">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Cart Total
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>

                  {/* Tax option removed as requested */}

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-base font-semibold text-gray-900">
                      <span>Total:</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* FIXED PROCEED TO CHECKOUT BUTTON - SIMPLE BLACK BACKGROUND */}
                <button
                  onClick={proceedToCheckout}
                  className="w-full mt-6 px-6 py-3 !bg-[#000000] !text-[#ffffff] !border-none rounded text-sm font-medium"
                >
                  Proceed to checkout
                </button>
              </div>
            </div>

            {/* Return to Shop Button */}
            <div className="mt-6">
              <button
                onClick={returnToShop}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium text-sm"
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
