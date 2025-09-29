'use client';

import React from 'react';
import { CheckCircle, Package, Truck, CreditCard } from 'lucide-react';

interface PaymentLoaderProps {
  isVisible: boolean;
  stage: 'processing' | 'success' | 'creating-order' | 'completed';
}

const PaymentLoader: React.FC<PaymentLoaderProps> = ({ isVisible, stage }) => {
  if (!isVisible) return null;

  const getStageContent = () => {
    switch (stage) {
      case 'processing':
        return {
          icon: <CreditCard className="w-12 h-12 text-blue-600 animate-pulse" />,
          title: 'Processing Payment',
          subtitle: 'Please wait while we process your payment...',
          showSpinner: true
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />,
          title: 'Payment Successful!',
          subtitle: 'Your payment has been processed successfully',
          showSpinner: false
        };
      case 'creating-order':
        return {
          icon: <Package className="w-12 h-12 text-orange-600 animate-pulse" />,
          title: 'Creating Your Order',
          subtitle: 'Setting up shipping and finalizing your order...',
          showSpinner: true
        };
      case 'completed':
        return {
          icon: <Truck className="w-12 h-12 text-green-600 animate-bounce" />,
          title: 'Order Placed Successfully!',
          subtitle: 'Redirecting you to order confirmation...',
          showSpinner: false
        };
      default:
        return {
          icon: <CreditCard className="w-12 h-12 text-blue-600" />,
          title: 'Processing',
          subtitle: 'Please wait...',
          showSpinner: true
        };
    }
  };

  const content = getStageContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 text-center">
        {/* Animated Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {content.icon}
            {content.showSpinner && (
              <div className="absolute -inset-2">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {content.title}
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 mb-6" style={{ fontSize: '1.4rem' }}>
          {content.subtitle}
        </p>

        {/* Progress Steps */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          {/* Payment Step */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              ['success', 'creating-order', 'completed'].includes(stage) 
                ? 'bg-green-500' 
                : stage === 'processing' 
                ? 'bg-blue-500 animate-pulse' 
                : 'bg-gray-300'
            }`}>
              {['success', 'creating-order', 'completed'].includes(stage) ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : (
                <CreditCard className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-xs mt-1 text-gray-600">Payment</span>
          </div>

          {/* Connection Line */}
          <div className={`h-0.5 w-8 ${
            ['creating-order', 'completed'].includes(stage) 
              ? 'bg-green-500' 
              : 'bg-gray-300'
          } transition-colors duration-500`}></div>

          {/* Order Step */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              stage === 'completed' 
                ? 'bg-green-500' 
                : stage === 'creating-order' 
                ? 'bg-orange-500 animate-pulse' 
                : 'bg-gray-300'
            }`}>
              {stage === 'completed' ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : (
                <Package className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-xs mt-1 text-gray-600">Order</span>
          </div>

          {/* Connection Line */}
          <div className={`h-0.5 w-8 ${
            stage === 'completed' 
              ? 'bg-green-500' 
              : 'bg-gray-300'
          } transition-colors duration-500`}></div>

          {/* Shipping Step */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              stage === 'completed' 
                ? 'bg-green-500' 
                : 'bg-gray-300'
            }`}>
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs mt-1 text-gray-600">Shipping</span>
          </div>
        </div>

        {/* Loading Dots Animation */}
        {content.showSpinner && (
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}

        {/* Success Checkmark Animation */}
        {stage === 'completed' && (
          <div className="mt-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentLoader;
