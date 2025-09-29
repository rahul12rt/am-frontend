'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, Truck, MapPin, Calendar, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

const OrderSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile } = useUser();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // If no order details in URL, redirect to home
    if (!orderId) {
      router.push('/');
      return;
    }

    // Set basic order details from URL params
    setOrderDetails({
      id: orderId,
    });
  }, [orderId, router]);

  // Redirect if not authenticated
  if (!profile) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
          <h2 className="font-bold mb-4 text-gray-900" style={{ fontSize: '2.2rem' }}>Authentication Required</h2>
          <p className="text-gray-600 mb-6" style={{ fontSize: '1.5rem' }}>Please sign in to view your order.</p>
          <Link
            href="/"
            className="block w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            style={{ fontSize: '1.5rem' }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-900" style={{ fontSize: '1.5rem' }}>Loading order details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[90px] pb-[70px] bg-gradient-to-br from-green-50 to-gray-100 min-h-screen">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="font-bold text-gray-900 mb-4" style={{ fontSize: '3rem' }}>
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-2" style={{ fontSize: '1.6rem' }}>
            Thank you for your purchase, {profile.first_name}!
          </p>
          <p className="text-gray-500" style={{ fontSize: '1.4rem' }}>
            Your order has been confirmed and is being processed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4" style={{ fontSize: '2.4rem' }}>Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 mb-2" style={{ fontSize: '1.4rem' }}>Order Number</p>
                <p className="font-bold text-gray-900" style={{ fontSize: '1.8rem' }}>{orderDetails.orderNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-2" style={{ fontSize: '1.4rem' }}>Order Date</p>
                <p className="font-medium text-gray-900" style={{ fontSize: '1.6rem' }}>
                  {new Date().toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-6" style={{ fontSize: '2rem' }}>Order Status</h3>
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                <div className="h-full bg-green-500 w-1/4 transition-all duration-500"></div>
              </div>
              
              {/* Status Steps */}
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-green-600 font-medium text-center" style={{ fontSize: '1.3rem' }}>
                    Order<br />Confirmed
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-400 font-medium text-center" style={{ fontSize: '1.3rem' }}>
                    Processing
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <Truck className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-400 font-medium text-center" style={{ fontSize: '1.3rem' }}>
                    Shipped
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <MapPin className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-400 font-medium text-center" style={{ fontSize: '1.3rem' }}>
                    Delivered
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="font-bold text-blue-900 mb-4" style={{ fontSize: '1.8rem' }}>What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-blue-800" style={{ fontSize: '1.4rem' }}>
                  We'll send you an email confirmation with your order details
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-blue-800" style={{ fontSize: '1.4rem' }}>
                  Your order will be processed and prepared for shipping within 1-2 business days
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-blue-800" style={{ fontSize: '1.4rem' }}>
                  You'll receive tracking information once your order ships
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-blue-800" style={{ fontSize: '1.4rem' }}>
                  Expected delivery: 3-7 business days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            style={{ fontSize: '1.6rem' }}
          >
            <Package className="w-5 h-5" />
            View All Orders
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link
            href="/collections"
            className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
            style={{ fontSize: '1.6rem' }}
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-gray-300 text-gray-600 font-medium rounded-lg hover:border-gray-900 hover:text-gray-900 transition-colors"
            style={{ fontSize: '1.6rem' }}
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        {/* Support Information */}
        <div className="text-center mt-12 p-6 bg-white rounded-2xl shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4" style={{ fontSize: '1.8rem' }}>Need Help?</h3>
          <p className="text-gray-600 mb-4" style={{ fontSize: '1.4rem' }}>
            If you have any questions about your order, feel free to contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@albanmarcus.com"
              className="text-blue-600 hover:text-blue-800 font-medium"
              style={{ fontSize: '1.4rem' }}
            >
              support@albanmarcus.com
            </a>
            <span className="hidden sm:inline text-gray-400">|</span>
            <a
              href="tel:+919999999999"
              className="text-blue-600 hover:text-blue-800 font-medium"
              style={{ fontSize: '1.4rem' }}
            >
              +91 99999 99999
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
