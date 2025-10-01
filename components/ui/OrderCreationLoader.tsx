'use client';

import React from 'react';
import { CheckCircle, Package, Truck, CreditCard, Loader2 } from 'lucide-react';

interface OrderCreationLoaderProps {
  stage: 'idle' | 'processing' | 'payment_success' | 'creating_order' | 'success' | 'error';
  message: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

const OrderCreationLoader: React.FC<OrderCreationLoaderProps> = ({ stage, message, onRetry, onCancel }) => {
  const getStageIcon = () => {
    switch (stage) {
      case 'processing':
        return <CreditCard className="w-8 h-8 text-blue-500" />;
      case 'payment_success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'creating_order':
        return <Package className="w-8 h-8 text-blue-500" />;
      case 'success':
        return <Truck className="w-8 h-8 text-green-500" />;
      case 'error':
        return <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">!</span>
        </div>;
      default:
        return <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />;
    }
  };

  const getStageColor = () => {
    switch (stage) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'payment_success':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  const getProgressWidth = () => {
    switch (stage) {
      case 'processing':
        return '25%';
      case 'payment_success':
        return '50%';
      case 'creating_order':
        return '75%';
      case 'success':
        return '100%';
      case 'error':
        return '0%';
      default:
        return '0%';
    }
  };

  if (stage === 'idle') return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 text-center relative">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {getStageIcon()}
            {(stage === 'processing' || stage === 'creating_order') && (
              <div className="absolute inset-0 animate-pulse">
                <div className="w-8 h-8 border-2 border-blue-200 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              stage === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: getProgressWidth() }}
          ></div>
        </div>

        {/* Message */}
        <h3 className={`font-bold mb-2 ${getStageColor()}`} style={{ fontSize: '1.8rem' }}>
          {stage === 'processing' && 'Processing Payment'}
          {stage === 'payment_success' && 'Payment Successful!'}
          {stage === 'creating_order' && 'Creating Order'}
          {stage === 'success' && 'Order Created!'}
          {stage === 'error' && 'Something went wrong'}
        </h3>

        <p className="text-gray-600" style={{ fontSize: '1.4rem' }}>
          {message}
        </p>

        {/* Loading Animation */}
        {(stage === 'processing' || stage === 'creating_order') && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {/* Success Animation */}
        {stage === 'success' && (
          <div className="mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Redirecting to order details...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {stage === 'error' && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                style={{ fontSize: '1.4rem' }}
              >
                Try Again
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                style={{ fontSize: '1.4rem' }}
              >
                Cancel
              </button>
            )}
            {!onRetry && !onCancel && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                style={{ fontSize: '1.4rem' }}
              >
                Reload Page
              </button>
            )}
          </div>
        )}

        {/* Processing State - Add Cancel Option */}
        {(stage === 'processing') && onCancel && (
          <div className="mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm underline"
            >
              Cancel Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCreationLoader;
