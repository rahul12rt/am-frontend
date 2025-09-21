"use client";
import React, { useState } from 'react';
import { MapPin, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { protectedApiClient } from '@/lib/api-clients';

interface PincodeCheckerProps {
  className?: string;
}

const PincodeChecker: React.FC<PincodeCheckerProps> = ({ className = "" }) => {
  const [pincode, setPincode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [serviceabilityResult, setServiceabilityResult] = useState<{
    serviceable: boolean;
    message: string;
    estimatedDays?: number;
  } | null>(null);
  
  const { showToast } = useToast();

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setPincode(value);
      // Reset result when user changes pincode
      if (serviceabilityResult) {
        setServiceabilityResult(null);
      }
    }
  };

  const checkServiceability = async () => {
    if (pincode.length !== 6) {
      showToast('Please enter a valid 6-digit pincode', 'error');
      return;
    }

    setIsChecking(true);
    
    try {
      // Call the actual Delhivery serviceability API (protected endpoint - requires auth)
      const response = await protectedApiClient.get(`/delhivery/serviceability/${pincode}`);
      const data = response.data;
      
      if (data.success) {
        setServiceabilityResult({
          serviceable: data.serviceable,
          message: data.serviceable 
            ? 'Great! We deliver to this location' 
            : data.message || 'Sorry, we don\'t deliver to this pincode yet',
          estimatedDays: data.serviceable ? Math.floor(Math.random() * 3) + 3 : undefined // 3-5 days
        });
        
        showToast(
          data.serviceable 
            ? 'Delivery available in your area!' 
            : data.message || 'Service not available in this area',
          data.serviceable ? 'success' : 'info'
        );
      } else {
        // Handle API error response
        setServiceabilityResult({
          serviceable: false,
          message: data.message || 'Unable to check serviceability',
          estimatedDays: undefined
        });
        
        showToast(data.message || 'Failed to check serviceability', 'error');
      }
    } catch (error) {
      console.error('Serviceability check error:', error);
      showToast('Failed to check serviceability. Please try again.', 'error');
      setServiceabilityResult(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkServiceability();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-5 h-5 text-gray-400" />
        <span className="text-white text-sm font-medium">Check Delivery</span>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={pincode}
            onChange={handlePincodeChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter pincode"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors"
            maxLength={6}
            inputMode="numeric"
          />
        </div>
        <button
          onClick={checkServiceability}
          disabled={pincode.length !== 6 || isChecking}
          className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        >
          {isChecking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Check'
          )}
        </button>
      </div>

      {serviceabilityResult && (
        <div className={`p-3 rounded-lg border ${
          serviceabilityResult.serviceable 
            ? 'bg-green-900/20 border-green-600/30 text-green-300' 
            : 'bg-red-900/20 border-red-600/30 text-red-300'
        }`}>
          <div className="flex items-start gap-2">
            {serviceabilityResult.serviceable ? (
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{serviceabilityResult.message}</p>
              {serviceabilityResult.serviceable && serviceabilityResult.estimatedDays && (
                <p className="text-sm mt-1 opacity-80">
                  Estimated delivery: {serviceabilityResult.estimatedDays}-{serviceabilityResult.estimatedDays + 2} business days
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PincodeChecker;
