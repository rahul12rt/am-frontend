'use client';

import React from 'react';
import { CheckCircle, Package, Truck, MapPin, Clock } from 'lucide-react';

interface StepperProps {
  shipments: Array<{
    status: string;
    date: string;
  }>;
  orderStatus: string;
}

const OrderStepper: React.FC<StepperProps> = ({ shipments, orderStatus }) => {
  // Define the standard order flow steps
  const standardSteps = [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: MapPin },
  ];

  // Map shipment statuses to our standard steps
  const getStepStatus = (stepKey: string) => {
    const statusMap: { [key: string]: string[] } = {
      'confirmed': ['confirmed', 'ordered', 'order confirmed'],
      'processing': ['processing', 'manifested', 'in transit'],
      'shipped': ['shipped', 'dispatched', 'out for delivery'],
      'delivered': ['delivered']
    };

    // Check if any shipment status matches this step
    const hasMatchingShipment = shipments.some(shipment => 
      statusMap[stepKey]?.some(status => 
        shipment.status.toLowerCase().includes(status.toLowerCase())
      )
    );

    // Also check order status for confirmed step
    if (stepKey === 'confirmed' && orderStatus.toLowerCase() === 'confirmed') {
      return 'completed';
    }

    return hasMatchingShipment ? 'completed' : 'pending';
  };

  // Get the latest date for a step
  const getStepDate = (stepKey: string) => {
    const statusMap: { [key: string]: string[] } = {
      'confirmed': ['confirmed', 'ordered', 'order confirmed'],
      'processing': ['processing', 'manifested', 'in transit'],
      'shipped': ['shipped', 'dispatched', 'out for delivery'],
      'delivered': ['delivered']
    };

    const matchingShipment = shipments.find(shipment => 
      statusMap[stepKey]?.some(status => 
        shipment.status.toLowerCase().includes(status.toLowerCase())
      )
    );

    return matchingShipment?.date;
  };

  // Determine current step index
  const currentStepIndex = standardSteps.findIndex(step => 
    getStepStatus(step.key) === 'pending'
  );
  const activeStepIndex = currentStepIndex === -1 ? standardSteps.length - 1 : Math.max(0, currentStepIndex - 1);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="font-bold text-gray-900 mb-4 sm:mb-6 text-lg sm:text-xl lg:text-2xl">
        Order Progress
      </h2>
      
      <div className="relative">
        {/* Progress Line - Hidden on mobile, shown on larger screens */}
        <div className="hidden sm:block absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
          <div 
            className="h-full bg-green-500 transition-all duration-500"
            style={{ 
              width: `${(activeStepIndex / (standardSteps.length - 1)) * 100}%` 
            }}
          ></div>
        </div>
        
        {/* Steps - Responsive layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between relative z-10 space-y-4 sm:space-y-0">
          {standardSteps.map((step, index) => {
            const status = getStepStatus(step.key);
            const stepDate = getStepDate(step.key);
            const Icon = step.icon;
            
            return (
              <div key={step.key} className="flex items-center sm:flex-col sm:items-center w-full sm:w-auto">
                {/* Mobile: Horizontal layout with connecting line */}
                <div className="flex items-center w-full sm:w-auto">
                  <div 
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                      status === 'completed' 
                        ? 'bg-green-500' 
                        : index === activeStepIndex + 1 
                          ? 'bg-blue-500' 
                          : 'bg-gray-200'
                    }`}
                  >
                    <Icon 
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        status === 'completed' || index === activeStepIndex + 1
                          ? 'text-white' 
                          : 'text-gray-400'
                      }`} 
                    />
                  </div>
                  
                  {/* Mobile connecting line */}
                  {index < standardSteps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-3 bg-gray-200 sm:hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                        style={{ 
                          width: status === 'completed' ? '100%' : '0%'
                        }}
                      ></div>
                    </div>
                  )}
                </div>
                
                <div className="ml-3 sm:ml-0 sm:mt-2 text-left sm:text-center flex-1 sm:flex-none">
                  <p 
                    className={`font-medium mb-1 text-sm sm:text-base ${
                      status === 'completed' 
                        ? 'text-green-600' 
                        : index === activeStepIndex + 1 
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  
                  {stepDate && (
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {new Date(stepDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What's Next Section */}
      {activeStepIndex < standardSteps.length - 1 && (
        <div className="mt-6 sm:mt-8 bg-blue-50 rounded-2xl p-4 sm:p-6">
          <h3 className="font-bold text-blue-900 mb-3 sm:mb-4 text-base sm:text-lg">
            What happens next?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p className="text-blue-800 text-sm sm:text-base">
                We'll send you an email confirmation with your order details
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p className="text-blue-800 text-sm sm:text-base">
                Your order will be processed and prepared for shipping within 1-2 business days
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p className="text-blue-800 text-sm sm:text-base">
                You'll receive tracking information once your order ships
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <p className="text-blue-800 text-sm sm:text-base">
                Expected delivery: 3-7 business days
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStepper;
