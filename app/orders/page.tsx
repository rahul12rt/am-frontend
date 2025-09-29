'use client';

import React from 'react';
import { Package, Truck, MapPin, Calendar, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import { protectedApiClient } from '@/lib/api-clients';

interface Order {
  id: string;
  order_number: string;
  order_status: string;
  total_amount: string;
  createdat: string;
  waybill: string;
  OrderItems: any[];
  shipments: Array<{
    status: string;
    date: string;
  }>;
}

const OrdersPage = () => {
  const { profile } = useUser();

  // Fetch user orders
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await protectedApiClient.get('/delhivery');
      return response.data;
    },
    enabled: !!profile,
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'outfordelivery':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
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
          <p className="text-gray-600 mb-6" style={{ fontSize: '1.5rem' }}>Please sign in to view your orders.</p>
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

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-900" style={{ fontSize: '1.5rem' }}>Loading your orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
          <h2 className="font-bold mb-4 text-gray-900" style={{ fontSize: '2.2rem' }}>Error Loading Orders</h2>
          <p className="text-gray-600 mb-6" style={{ fontSize: '1.5rem' }}>Unable to load your orders. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            style={{ fontSize: '1.5rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const orders = ordersData?.orders || [];

  return (
    <div className="pt-[90px] pb-[70px] bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-gray-900 mb-4" style={{ fontSize: '3rem' }}>
            My Orders
          </h1>
          <p className="text-gray-600" style={{ fontSize: '1.6rem' }}>
            Track and manage your orders
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="font-bold text-gray-900 mb-4" style={{ fontSize: '2.4rem' }}>
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-8" style={{ fontSize: '1.6rem' }}>
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              style={{ fontSize: '1.6rem' }}
            >
              Start Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: Order) => (
              <div key={order.id} className="bg-white rounded-3xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="font-bold text-gray-900" style={{ fontSize: '1.8rem' }}>
                        Order #{order.order_number}
                      </h3>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                        {getStatusIcon(order.order_status)}
                        {formatStatus(order.order_status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                      <div>
                        <p className="text-sm font-medium mb-1">Order Date</p>
                        <p style={{ fontSize: '1.4rem' }}>
                          {new Date(order.createdat).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Total Amount</p>
                        <p className="font-bold text-gray-900" style={{ fontSize: '1.4rem' }}>
                          ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Items</p>
                        <p style={{ fontSize: '1.4rem' }}>
                          {order.OrderItems?.length || 0} item(s)
                        </p>
                      </div>
                    </div>

                    {/* Shipment Status */}
                    {order.shipments && order.shipments.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-2">Latest Update</p>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-gray-900" style={{ fontSize: '1.3rem' }}>
                            {order.shipments[order.shipments.length - 1]?.status}
                          </span>
                          <span className="text-gray-500" style={{ fontSize: '1.2rem' }}>
                            {new Date(order.shipments[order.shipments.length - 1]?.date).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
                      style={{ fontSize: '1.4rem' }}
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
                    
                    {order.waybill && (
                      <a
                        href={`https://www.delhivery.com/track/package/${order.waybill}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        style={{ fontSize: '1.4rem' }}
                      >
                        <Truck className="w-4 h-4" />
                        Track Order
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Shopping */}
        <div className="text-center mt-12">
          <Link
            href="/collections"
            className="inline-flex items-center gap-3 px-8 py-4 border-2 border-gray-300 text-gray-600 font-medium rounded-lg hover:border-gray-900 hover:text-gray-900 transition-colors"
            style={{ fontSize: '1.6rem' }}
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
