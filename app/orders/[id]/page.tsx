'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, Truck, MapPin, Calendar, ArrowLeft, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import { protectedApiClient } from '@/lib/api-clients';
import Image from 'next/image';
import OrderStepper from '@/components/ui/OrderStepper';

interface OrderDetails {
  id: string;
  order_number: string;
  order_status: string;
  total_amount: string;
  subtotal_amount: string;
  discount_amount: string;
  createdat: string;
  waybill: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  OrderItems: Array<{
    id: string;
    quantity: number;
    unit_price: string;
    total_price: string;
    WatchColor: {
      watch_name: string;
      name: string;
    };
    imageURL: string;
  }>;
  ShippingAddress: {
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    landmark?: string;
  };
  BillingAddress: {
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    landmark?: string;
  };
  Payments: Array<{
    payment_method: string;
    payment_status: string;
    amount: string;
    gateway_payment_id: string;
    completed_at: string;
  }>;
  shipments: Array<{
    status: string;
    date: string;
  }>;
}

const OrderDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { profile } = useUser();
  const orderId = params.id as string;

  // Fetch order details
  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await protectedApiClient.get(`/delhivery/${orderId}`);
      return response.data;
    },
    enabled: !!profile && !!orderId,
    staleTime: 30 * 1000, // 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'outfordelivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'outfordelivery':
        return 'Out for Delivery';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Redirect if not authenticated
  if (!profile) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
          <h2 className="font-bold mb-4 text-gray-900" style={{ fontSize: '2.2rem' }}>Authentication Required</h2>
          <p className="text-gray-600 mb-6" style={{ fontSize: '1.5rem' }}>Please sign in to view order details.</p>
          <Link
            href="/"
            className="block w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:opacity-80 transition-opacity"
            style={{ fontSize: '1.5rem' }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-900" style={{ fontSize: '1.5rem' }}>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error || !orderData?.order) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
          <h2 className="font-bold mb-4 text-gray-900" style={{ fontSize: '2.2rem' }}>Order Not Found</h2>
          <p className="text-gray-600 mb-6" style={{ fontSize: '1.5rem' }}>The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            href="/orders"
            className="block w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:opacity-80 transition-opacity"
            style={{ fontSize: '1.5rem' }}
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const order: OrderDetails = orderData.order;
  const shipments = orderData.shipments || [];

  return (
    <div className="pt-[90px] pb-[70px] bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-gray-300 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900" style={{ fontSize: '2.8rem' }}>
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600" style={{ fontSize: '1.4rem' }}>
              Placed on {new Date(order.createdat).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900" style={{ fontSize: '2.2rem' }}>Order Status</h2>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${getStatusColor(order.order_status)}`}>
                  <Package className="w-4 h-4" />
                  {formatStatus(order.order_status)}
                </span>
              </div>

              {/* Order Stepper */}
              <OrderStepper 
                orderStatus={order.order_status}
                shipments={shipments}
              />

              {/* Track Package Button */}
              {order.waybill && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <a
                    href={`https://www.delhivery.com/track/package/${order.waybill}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:opacity-80 transition-opacity"
                    style={{ fontSize: '1.4rem' }}
                  >
                    <Truck className="w-4 h-4" />
                    Track Package
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-6" style={{ fontSize: '2.2rem' }}>Order Items</h2>
              <div className="space-y-4">
                {order.OrderItems?.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-20 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
                      <Image 
                        src={item.imageURL || "/images/alban-marcus-watch.png"} 
                        alt={item.WatchColor?.watch_name || 'Watch'} 
                        width={64} 
                        height={80} 
                        className="w-full h-full object-contain p-1" 
                        onError={(e) => {
                          e.currentTarget.src = '/images/alban-marcus-watch.png';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900" style={{ fontSize: '1.6rem' }}>
                        {item.WatchColor?.watch_name || 'Watch'}
                      </h3>
                      <p className="text-gray-600" style={{ fontSize: '1.4rem' }}>
                        Color: {item.WatchColor?.name || 'Default'}
                      </p>
                      <p className="text-gray-600" style={{ fontSize: '1.4rem' }}>
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="font-bold text-gray-900" style={{ fontSize: '1.6rem' }}>
                        ₹{parseFloat(item.total_price).toLocaleString('en-IN')}
                      </p>
                      <p className="text-gray-600" style={{ fontSize: '1.3rem' }}>
                        ₹{parseFloat(item.unit_price).toLocaleString('en-IN')} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4" style={{ fontSize: '1.8rem' }}>Shipping Address</h3>
                <div className="text-gray-600" style={{ fontSize: '1.4rem' }}>
                  <p className="font-medium text-gray-900">{order.ShippingAddress?.full_name}</p>
                  <p>{order.ShippingAddress?.address_line1}</p>
                  {order.ShippingAddress?.address_line2 && <p>{order.ShippingAddress.address_line2}</p>}
                  <p>{order.ShippingAddress?.city}, {order.ShippingAddress?.state} {order.ShippingAddress?.postal_code}</p>
                  <p>{order.ShippingAddress?.country}</p>
                  {order.ShippingAddress?.landmark && <p>Landmark: {order.ShippingAddress.landmark}</p>}
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4" style={{ fontSize: '1.8rem' }}>Billing Address</h3>
                <div className="text-gray-600" style={{ fontSize: '1.4rem' }}>
                  <p className="font-medium text-gray-900">{order.BillingAddress?.full_name}</p>
                  <p>{order.BillingAddress?.address_line1}</p>
                  {order.BillingAddress?.address_line2 && <p>{order.BillingAddress.address_line2}</p>}
                  <p>{order.BillingAddress?.city}, {order.BillingAddress?.state} {order.BillingAddress?.postal_code}</p>
                  <p>{order.BillingAddress?.country}</p>
                  {order.BillingAddress?.landmark && <p>Landmark: {order.BillingAddress.landmark}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-6" style={{ fontSize: '2rem' }}>Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600" style={{ fontSize: '1.4rem' }}>Subtotal</span>
                  <span className="font-medium text-gray-900" style={{ fontSize: '1.4rem' }}>
                    ₹{parseFloat(order.subtotal_amount).toLocaleString('en-IN')}
                  </span>
                </div>
                {parseFloat(order.discount_amount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600" style={{ fontSize: '1.4rem' }}>Discount</span>
                    <span className="font-medium text-green-600" style={{ fontSize: '1.4rem' }}>
                      -₹{parseFloat(order.discount_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600" style={{ fontSize: '1.4rem' }}>Shipping</span>
                  <span className="font-medium text-gray-900" style={{ fontSize: '1.4rem' }}>Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900" style={{ fontSize: '1.6rem' }}>Total</span>
                    <span className="font-bold text-gray-900" style={{ fontSize: '1.6rem' }}>
                      ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {order.Payments && order.Payments.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-6" style={{ fontSize: '2rem' }}>Payment Details</h3>
                {order.Payments.map((payment, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-600" style={{ fontSize: '1.4rem' }}>
                        Payment Successful
                      </span>
                    </div>
                    <div className="space-y-2 text-gray-600" style={{ fontSize: '1.3rem' }}>
                    {/* <p>Method: {payment.payment_method.toUpperCase()}</p> v*/}
                      <p>Amount: ₹{parseFloat(payment.amount).toLocaleString('en-IN')}</p>
                      <p>Transaction ID: {payment.gateway_payment_id}</p>
                      <p>Date: {new Date(payment.completed_at).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customer Information */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-6" style={{ fontSize: '2rem' }}>Customer Information</h3>
              <div className="space-y-3 text-gray-600" style={{ fontSize: '1.4rem' }}>
                <p><span className="font-medium text-gray-900">Name:</span> {order.customer_name}</p>
                <p><span className="font-medium text-gray-900">Email:</span> {order.customer_email}</p>
                <p><span className="font-medium text-gray-900">Phone:</span> {order.customer_phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
