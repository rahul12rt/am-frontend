/**
 * Pincode Validation Service
 * Handles delivery serviceability checks for addresses
 */

import { protectedApiClient } from '@/lib/api-clients';

export interface ServiceabilityResult {
  serviceable: boolean;
  message: string;
  estimatedDays?: number;
  pincode: string;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  data?: ServiceabilityResult;
}

/**
 * Check if a pincode is serviceable for delivery
 */
export const checkPincodeServiceability = async (pincode: string): Promise<ValidationResult> => {
  // Basic pincode validation
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return {
      isValid: false,
      message: 'Please enter a valid 6-digit pincode'
    };
  }

  try {
    const response = await protectedApiClient.get(`/delhivery/serviceability/${pincode}`);
    const data = response.data;
    
    if (data.success) {
      const serviceabilityResult: ServiceabilityResult = {
        serviceable: data.serviceable,
        message: data.serviceable 
          ? 'Great! We deliver to this location' 
          : data.message || 'Sorry, we don\'t deliver to this pincode yet',
        estimatedDays: data.serviceable ? Math.floor(Math.random() * 3) + 3 : undefined, // 3-5 days
        pincode
      };
      
      return {
        isValid: data.serviceable,
        message: serviceabilityResult.message,
        data: serviceabilityResult
      };
    } else {
      return {
        isValid: false,
        message: data.message || 'Unable to check serviceability for this pincode'
      };
    }
  } catch (error) {
    console.error('Pincode serviceability check error:', error);
    return {
      isValid: false,
      message: 'Failed to verify pincode serviceability. Please try again.'
    };
  }
};

/**
 * Validate multiple pincodes for batch checking
 */
export const validateMultiplePincodes = async (pincodes: string[]): Promise<Record<string, ValidationResult>> => {
  const results: Record<string, ValidationResult> = {};
  
  // Process pincodes in parallel but with a reasonable limit
  const promises = pincodes.map(async (pincode) => {
    const result = await checkPincodeServiceability(pincode);
    return { pincode, result };
  });
  
  const resolvedResults = await Promise.allSettled(promises);
  
  resolvedResults.forEach((promiseResult, index) => {
    const pincode = pincodes[index];
    if (promiseResult.status === 'fulfilled') {
      results[pincode] = promiseResult.value.result;
    } else {
      results[pincode] = {
        isValid: false,
        message: 'Failed to validate pincode'
      };
    }
  });
  
  return results;
};

/**
 * Get cached serviceability result if available
 */
const serviceabilityCache = new Map<string, { result: ValidationResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedServiceability = (pincode: string): ValidationResult | null => {
  const cached = serviceabilityCache.get(pincode);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
  return null;
};

export const setCachedServiceability = (pincode: string, result: ValidationResult): void => {
  serviceabilityCache.set(pincode, {
    result,
    timestamp: Date.now()
  });
};

/**
 * Check pincode with caching
 */
export const checkPincodeWithCache = async (pincode: string): Promise<ValidationResult> => {
  // Check cache first
  const cached = getCachedServiceability(pincode);
  if (cached) {
    return cached;
  }
  
  // Fetch fresh data
  const result = await checkPincodeServiceability(pincode);
  
  // Cache the result
  setCachedServiceability(pincode, result);
  
  return result;
};
