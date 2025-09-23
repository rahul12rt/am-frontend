/**
 * Checkout Validation Service
 * Comprehensive validation for checkout process
 */

import { checkPincodeWithCache } from './pincodeValidation';
import { type Address } from '@/lib/api-services';
import { type UserProfile } from '@/types/user';

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AddressValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  pincodeServiceable?: boolean;
  estimatedDelivery?: string;
}

/**
 * Validate user profile completeness for checkout
 */
export const validateUserProfile = (profile: UserProfile | null): CheckoutValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!profile) {
    errors.push('Please login to continue with checkout');
    return { isValid: false, errors, warnings };
  }

  // Required fields validation
  if (!profile.first_name?.trim()) {
    errors.push('First name is required');
  }

  if (!profile.email?.trim()) {
    errors.push('Email address is required');
  } else if (!isValidEmail(profile.email)) {
    errors.push('Please provide a valid email address');
  }

  if (!profile.phone_number?.trim()) {
    errors.push('Phone number is required');
  } else if (!isValidPhoneNumber(profile.phone_number)) {
    errors.push('Please provide a valid 10-digit phone number');
  }

  // Optional but recommended fields
  if (!profile.last_name?.trim()) {
    warnings.push('Last name is recommended for delivery');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate address completeness and serviceability
 */
export const validateAddress = async (address: Address): Promise<AddressValidationResult> => {
  const errors: Record<string, string> = {};
  let pincodeServiceable = false;
  let estimatedDelivery: string | undefined;

  // Required field validation
  if (!address.full_name?.trim()) {
    errors.full_name = 'Full name is required';
  }

  if (!address.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhoneNumber(address.phone)) {
    errors.phone = 'Please provide a valid 10-digit phone number';
  }

  if (!address.address_line1?.trim()) {
    errors.address_line1 = 'Address line 1 is required';
  }

  if (!address.city?.trim()) {
    errors.city = 'City is required';
  }

  if (!address.state?.trim()) {
    errors.state = 'State is required';
  }

  if (!address.postal_code?.trim()) {
    errors.postal_code = 'Pincode is required';
  } else if (!/^\d{6}$/.test(address.postal_code)) {
    errors.postal_code = 'Please provide a valid 6-digit pincode';
  } else {
    // Check pincode serviceability
    try {
      const pincodeResult = await checkPincodeWithCache(address.postal_code);
      if (!pincodeResult.isValid) {
        errors.postal_code = pincodeResult.message;
      } else {
        pincodeServiceable = true;
        if (pincodeResult.data?.estimatedDays) {
          estimatedDelivery = `${pincodeResult.data.estimatedDays}-${pincodeResult.data.estimatedDays + 2} business days`;
        }
      }
    } catch (error) {
      errors.postal_code = 'Unable to verify pincode serviceability';
    }
  }

  if (!address.country?.trim()) {
    errors.country = 'Country is required';
  }

  return {
    isValid: Object.keys(errors).length === 0 && pincodeServiceable,
    errors,
    pincodeServiceable,
    estimatedDelivery
  };
};

/**
 * Validate checkout readiness
 */
export const validateCheckoutReadiness = async (
  profile: UserProfile | null,
  billingAddress: Address | null,
  shippingAddress: Address | null,
  cartItems: any[]
): Promise<CheckoutValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Cart validation
  if (!cartItems || cartItems.length === 0) {
    errors.push('Your cart is empty');
    return { isValid: false, errors, warnings };
  }

  // Profile validation
  const profileValidation = validateUserProfile(profile);
  errors.push(...profileValidation.errors);
  warnings.push(...profileValidation.warnings);

  // Billing address validation
  if (!billingAddress) {
    errors.push('Please select a billing address');
  } else {
    const billingValidation = await validateAddress(billingAddress);
    if (!billingValidation.isValid) {
      errors.push('Billing address is incomplete or not serviceable');
      if (billingValidation.errors.postal_code) {
        errors.push(`Billing address: ${billingValidation.errors.postal_code}`);
      }
    }
  }

  // Shipping address validation
  if (!shippingAddress) {
    errors.push('Please select a shipping address');
  } else {
    const shippingValidation = await validateAddress(shippingAddress);
    if (!shippingValidation.isValid) {
      errors.push('Shipping address is incomplete or not serviceable');
      if (shippingValidation.errors.postal_code) {
        errors.push(`Shipping address: ${shippingValidation.errors.postal_code}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate payment readiness (final check before Razorpay)
 */
export const validatePaymentReadiness = async (
  profile: UserProfile | null,
  billingAddress: Address | null,
  shippingAddress: Address | null,
  cartItems: any[],
  totalAmount: number
): Promise<CheckoutValidationResult> => {
  const checkoutValidation = await validateCheckoutReadiness(
    profile,
    billingAddress,
    shippingAddress,
    cartItems
  );

  const errors = [...checkoutValidation.errors];
  const warnings = [...checkoutValidation.warnings];

  // Additional payment-specific validations
  if (totalAmount <= 0) {
    errors.push('Invalid order amount');
  }

  if (totalAmount > 500000) { // 5 lakh limit
    errors.push('Order amount exceeds maximum limit of ₹5,00,000');
  }

  // Verify addresses are still serviceable (in case of long checkout session)
  if (billingAddress && shippingAddress) {
    const [billingCheck, shippingCheck] = await Promise.all([
      checkPincodeWithCache(billingAddress.postal_code),
      checkPincodeWithCache(shippingAddress.postal_code)
    ]);

    if (!billingCheck.isValid) {
      errors.push(`Billing address pincode is no longer serviceable: ${billingCheck.message}`);
    }

    if (!shippingCheck.isValid) {
      errors.push(`Shipping address pincode is no longer serviceable: ${shippingCheck.message}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Helper functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phone: string): boolean => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Check if it's a valid 10-digit Indian mobile number
  return /^[6-9]\d{9}$/.test(cleanPhone);
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return `Please fix the following issues:\n• ${errors.join('\n• ')}`;
};

/**
 * Format validation warnings for display
 */
export const formatValidationWarnings = (warnings: string[]): string => {
  if (warnings.length === 0) return '';
  if (warnings.length === 1) return warnings[0];
  return `Please note:\n• ${warnings.join('\n• ')}`;
};
