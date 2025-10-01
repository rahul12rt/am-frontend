"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, Edit, Plus, CreditCard, Shield, Loader2, User, Mail, Phone, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import { useCart } from '@/hooks/queries/useCart';
import { useAddresses } from '@/hooks/queries/useAddress';
import AddressForm from '@/components/organisms/checkout/AddressForm';
import PaymentIcons from '@/components/atoms/PaymentIcons';
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout';
import OrderCreationLoader from '@/components/ui/OrderCreationLoader';
import { type Address } from '@/lib/api-services';
import Image from 'next/image';
import Link from 'next/link';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { 
  validatePaymentReadiness, 
  validateUserProfile, 
  formatValidationErrors, 
  formatValidationWarnings 
} from '@/services/checkoutValidation';

const CheckoutPage = () => {
  const { data: cartData, isLoading: cartLoading } = useCart();
  const { profile, refetchProfile } = useUser();
  const { data: userAddresses, isLoading: addressesLoading, refetch: refetchAddresses } = useAddresses();
  const { showToast } = useToast();
  const { payNow, isProcessing, paymentStage, loadingMessage, cancelPayment, retryPayment } = useRazorpayCheckout();

  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>('');
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isValidatingPayment, setIsValidatingPayment] = useState(false);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressType, setAddressType] = useState<'billing' | 'shipping'>('billing');
  const [lastPaymentParams, setLastPaymentParams] = useState<any>(null);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);

  // Use addresses from React Query hook
  const addresses = userAddresses || [];
  const deliveryFee = 0;
  const subtotal = cartData?.summary?.totalAmount ? parseFloat(cartData.summary.totalAmount) : 0;
  const isEligibleForDiscount = profile?.eligibleForDiscount || false;
  const discountAmount = isEligibleForDiscount ? (subtotal * 0.1) : 0;
  const finalTotal = subtotal - discountAmount + deliveryFee;

  // Validate checkout readiness
  const validateCheckout = async () => {
    setIsValidatingPayment(true);
    setValidationErrors([]);
    setValidationWarnings([]);

    try {
      // Get selected addresses
      const billingAddress = addresses.find(addr => addr.id.toString() === selectedBillingAddress) || null;
      const shippingAddress = addresses.find(addr => addr.id.toString() === selectedShippingAddress) || null;

      // Comprehensive validation
      const validation = await validatePaymentReadiness(
        profile,
        billingAddress,
        shippingAddress,
        cartData?.items || [],
        finalTotal
      );

      setValidationErrors(validation.errors);
      setValidationWarnings(validation.warnings);

      return validation.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      setValidationErrors(['Failed to validate checkout. Please try again.']);
      return false;
    } finally {
      setIsValidatingPayment(false);
    }
  };

  // Handle payment with Razorpay
  const handleCompletePayment = async () => {
    // Run comprehensive validation
    const isValid = await validateCheckout();
    
    if (!isValid) {
      const errorMessage = formatValidationErrors(validationErrors);
      showToast(errorMessage, 'error');
      return;
    }

    // Show warnings if any
    if (validationWarnings.length > 0) {
      const warningMessage = formatValidationWarnings(validationWarnings);
      showToast(warningMessage, 'info');
    }

    if (!cartData?.items || cartData.items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!profile) {
      showToast('Please login to complete purchase', 'error');
      return;
    }

    // Create items summary
    const itemsSummary = cartData.items.length === 1 
      ? `${cartData.items[0].watchColor?.Watch?.name || 'Watch'}` 
      : `${cartData.items.length} watches`;

    // Get user details for prefill
    const prefillData = {
      name: profile.first_name || 'Customer',
      email: profile.email || 'customer@example.com',
      contact: `${profile.phone_country_code || '+91'}${profile.phone_number}` || '9999999999'
    };

    // Validate address selection
    if (!selectedBillingAddress) {
      showToast('Please select a billing address', 'error');
      return;
    }

    const finalShippingAddress = useSameAddress ? selectedBillingAddress : selectedShippingAddress;
    if (!finalShippingAddress) {
      showToast('Please select a shipping address', 'error');
      return;
    }

    try {
      const paymentParams = {
        totalAmountInRupees: finalTotal,
        itemsSummary: itemsSummary,
        prefill: prefillData,
        billingAddressId: selectedBillingAddress,
        shippingAddressId: finalShippingAddress,
        cartData: cartData // Pass current cart data to lock pricing
      };
      
      // Store payment parameters for retry functionality
      setLastPaymentParams(paymentParams);
      
      await payNow(paymentParams);
    } catch (error) {
      console.error('Payment error:', error);
      showToast('Payment failed. Please try again.', 'error');
    }
  };

  // Set default addresses when addresses are loaded
  React.useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(addr => addr.is_default);
      const billingAddresses = addresses.filter(addr => addr.is_billing_address);
      const shippingAddresses = addresses.filter(addr => addr.is_shipping_address);
      
      if (!selectedBillingAddress && billingAddresses.length > 0) {
        const defaultBilling = billingAddresses.find(addr => addr.is_default) || billingAddresses[0];
        setSelectedBillingAddress(defaultBilling.id.toString());
      }
      
      if (!selectedShippingAddress && shippingAddresses.length > 0) {
        const defaultShipping = shippingAddresses.find(addr => addr.is_default) || shippingAddresses[0];
        setSelectedShippingAddress(defaultShipping.id.toString());
      }
    }
  }, [addresses, selectedBillingAddress, selectedShippingAddress]);

  // Refresh profile when checkout page loads (in case user just came from email verification)
  React.useEffect(() => {
    const refreshProfileOnLoad = async () => {
      try {
        console.log('Refreshing profile on checkout page load...');
        await refetchProfile();
        console.log('Profile refreshed on checkout page');
      } catch (error) {
        console.error('Failed to refresh profile on checkout page:', error);
      }
    };

    if (profile) {
      refreshProfileOnLoad();
    }
  }, []); // Only run once when component mounts

  const handleAddressSuccess = async (address: Address) => {
    setShowAddressForm(false);
    setEditingAddress(null);
    
    // Refresh addresses to get the latest data
    try {
      await refetchAddresses();
      
      // Auto-select the new/updated address
      if (address.is_billing_address && (addressType === 'billing' || !editingAddress)) {
        setSelectedBillingAddress(address.id.toString());
      }
      if (address.is_shipping_address && (addressType === 'shipping' || useSameAddress || !editingAddress)) {
        setSelectedShippingAddress(address.id.toString());
      }
      
      showToast(`Address ${editingAddress ? 'updated' : 'added'} successfully!`, 'success');
    } catch (error) {
      console.error('Failed to refresh addresses:', error);
      showToast(`Address ${editingAddress ? 'updated' : 'added'} successfully! Please refresh if not visible.`, 'success');
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleAddNewAddress = (type: 'billing' | 'shipping' = 'billing') => {
    setEditingAddress(null);
    setAddressType(type);
    setShowAddressForm(true);
  };

  // Validate profile on load
  useEffect(() => {
    if (profile) {
      const profileValidation = validateUserProfile(profile);
      if (!profileValidation.isValid) {
        setValidationErrors(profileValidation.errors);
      }
      if (profileValidation.warnings.length > 0) {
        setValidationWarnings(profileValidation.warnings);
      }
    }
  }, [profile]);

  // Show loading state
  if (cartLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
          <span className="text-gray-900" style={{ fontSize: '1.5rem' }}>Loading Checkout...</span>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!profile) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
          <h2 className="font-bold mb-4 text-gray-900" style={{ fontSize: '2.2rem' }}>Authentication Required</h2>
          <p className="text-gray-600 mb-6" style={{ fontSize: '1.5rem' }}>Please sign in to access checkout.</p>
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

  // Show empty cart message
  if (!cartData?.items || cartData.items.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
          <h2 className="font-bold mb-4 text-gray-900" style={{ fontSize: '2.2rem' }}>Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6" style={{ fontSize: '1.5rem' }}>Add some items to your cart before checkout.</p>
          <Link
            href="/collections"
            className="block w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            style={{ fontSize: '1.5rem' }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[90px] pb-[70px] bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="container">
        {/* Breadcrumb */}
        <div className="flex items-center pb-[40px] gap-2 text-gray-700" style={{ fontSize: '1.5rem' }}>
          <Link href="/" className="opacity-60 hover:opacity-100 hover:text-black transition-colors">
            Home
          </Link>
          <MdKeyboardArrowRight className="opacity-60" />
          <Link href="/cart" className="opacity-60 hover:opacity-100 hover:text-black transition-colors">
            Cart
          </Link>
          <MdKeyboardArrowRight className="opacity-60" />
          <span className="text-black font-medium">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-bold text-gray-900" style={{ fontSize: '2.2rem' }}>Profile Information</h2>
                <button
                  onClick={async () => {
                    try {
                      setIsRefreshingProfile(true);
                      showToast('Refreshing profile...', 'info');
                      await refetchProfile();
                      showToast('Profile refreshed successfully!', 'success');
                    } catch (error) {
                      showToast('Failed to refresh profile', 'error');
                    } finally {
                      setIsRefreshingProfile(false);
                    }
                  }}
                  disabled={isRefreshingProfile}
                  className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh profile information"
                >
                  {isRefreshingProfile ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <RefreshCw size={20} />
                  )}
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="text-gray-600" size={20} />
                  <span className="text-gray-900" style={{ fontSize: '1.5rem' }}>
                    {profile.first_name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-600" size={20} />
                  <span className="text-gray-900" style={{ fontSize: '1.5rem' }}>
                    {profile.email || 'No email provided'}
                  </span>
                  {profile.email_verified ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <span className="text-red-500 font-medium" style={{ fontSize: '1.3rem' }}>Unverified</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-600" size={20} />
                  <span className="text-gray-900" style={{ fontSize: '1.5rem' }}>
                    {profile.phone_number || 'No phone provided'}
                  </span>
                  {profile.phone_verified && <CheckCircle size={20} className="text-green-500" />}
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-6" style={{ fontSize: '2.2rem' }}>Billing Address</h2>
              {addressesLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
                  <span className="text-gray-900" style={{ fontSize: '1.5rem' }}>Loading addresses...</span>
                </div>
              ) : addresses && addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses
                    .filter(address => address.is_billing_address)
                    .map(address => (
                      <div
                        key={address.id}
                        onClick={() => setSelectedBillingAddress(address.id.toString())}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                          selectedBillingAddress === address.id.toString() 
                            ? 'border-gray-900 bg-gray-50' 
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="space-y-2">
                          <p className="text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>
                            {address.full_name}
                            {address.is_default && (
                              <span className="text-xs bg-gray-900 text-white px-2 py-1 ml-2 rounded uppercase font-bold">Default</span>
                            )}
                          </p>
                          <p className="text-gray-700" style={{ fontSize: '1.3rem' }}>
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-gray-700" style={{ fontSize: '1.3rem' }}>
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-gray-700" style={{ fontSize: '1.3rem' }}>{address.country}</p>
                          {address.landmark && (
                            <p className="text-gray-600" style={{ fontSize: '1.3rem' }}>Landmark: {address.landmark}</p>
                          )}
                        </div>
                        {/* Selection indicator */}
                        {selectedBillingAddress === address.id.toString() && (
                          <div className="absolute top-4 right-4 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  <button
                    onClick={() => handleAddNewAddress('billing')}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                    style={{ fontSize: '1.5rem' }}
                  >
                    <Plus size={20} /> Add New Address
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4" style={{ fontSize: '1.5rem' }}>No billing addresses found</p>
                  <button
                    onClick={() => handleAddNewAddress('billing')}
                    className="w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    style={{ fontSize: '1.5rem' }}
                  >
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-6" style={{ fontSize: '2.2rem' }}>Shipping Address</h2>
              <label className="flex items-center gap-4 mb-6">
                <input 
                  type="checkbox" 
                  checked={useSameAddress} 
                  onChange={() => setUseSameAddress(!useSameAddress)} 
                  className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <span className="text-gray-900" style={{ fontSize: '1.5rem' }}>Same as my billing address</span>
              </label>
              {!useSameAddress && (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4" style={{ fontSize: '1.3rem' }}>Select a different shipping address:</p>
                  {addressesLoading ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
                      <span className="text-gray-900" style={{ fontSize: '1.5rem' }}>Loading addresses...</span>
                    </div>
                  ) : addresses && addresses.filter(addr => addr.is_shipping_address).length > 0 ? (
                    <div className="space-y-3">
                      {addresses
                        .filter(address => address.is_shipping_address)
                        .map(address => (
                          <div
                            key={address.id}
                            onClick={() => setSelectedShippingAddress(address.id.toString())}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                              selectedShippingAddress === address.id.toString() 
                                ? 'border-gray-900 bg-gray-50' 
                                : 'border-gray-300 hover:border-gray-500'
                            }`}
                          >
                            <div className="space-y-2">
                              <p className="text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>
                                {address.full_name}
                                {address.is_default && (
                                  <span className="text-xs bg-gray-900 text-white px-2 py-1 ml-2 rounded uppercase font-bold">Default</span>
                                )}
                              </p>
                              <p className="text-gray-700" style={{ fontSize: '1.3rem' }}>
                                {address.address_line1}
                                {address.address_line2 && `, ${address.address_line2}`}
                              </p>
                              <p className="text-gray-700" style={{ fontSize: '1.3rem' }}>
                                {address.city}, {address.state} {address.postal_code}
                              </p>
                              <p className="text-gray-700" style={{ fontSize: '1.3rem' }}>{address.country}</p>
                              {address.landmark && (
                                <p className="text-gray-600" style={{ fontSize: '1.3rem' }}>Landmark: {address.landmark}</p>
                              )}
                            </div>
                            {/* Selection indicator */}
                            {selectedShippingAddress === address.id.toString() && (
                              <div className="absolute top-4 right-4 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      <button
                        onClick={() => handleAddNewAddress('shipping')}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                        style={{ fontSize: '1.5rem' }}
                      >
                        <Plus size={20} /> Add New Shipping Address
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4" style={{ fontSize: '1.5rem' }}>No shipping addresses found</p>
                      <button
                        onClick={() => handleAddNewAddress('shipping')}
                        className="w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        style={{ fontSize: '1.5rem' }}
                      >
                        Add Shipping Address
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky space-y-6" style={{ top: '85px' }}>
              {/* Order Summary */}
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-6" style={{ fontSize: '2.2rem' }}>Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {cartData?.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-20 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
                        <Image 
                          src={item.imageURL || '/images/alban-marcus-watch.png'} 
                          alt={item.name || ''} 
                          width={64} 
                          height={80} 
                          className="w-full h-full object-contain p-1" 
                          onError={(e) => {
                            e.currentTarget.src = '/images/alban-marcus-watch.png';
                          }}
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="text-gray-900 font-medium" style={{ fontSize: '1.4rem' }}>{item.name}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-gray-600" style={{ fontSize: '1.3rem' }}>Qty: {item.quantity}</p>
                          <p className="text-gray-900 font-bold" style={{ fontSize: '1.4rem' }}>₹{item.price ? (parseFloat(item.price) * item.quantity).toLocaleString('en-IN') : '0'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700" style={{ fontSize: '1.5rem' }}>Order value</span>
                    <span className="text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  {/* Discount Section with Popper Animation */}
                  {isEligibleForDiscount && discountAmount > 0 && (
                    <div className="relative">
                      <div className="animate-bounce bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 shadow-lg transform transition-all duration-700 hover:scale-105">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🎉</span>
                            <div>
                              <span className="text-green-700 font-bold" style={{ fontSize: '1.4rem' }}>Special Discount (10%)</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                  APPLIED
                                </span>
                                <span className="text-green-600 text-sm">You're saving big!</span>
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-green-700" style={{ fontSize: '1.6rem' }}>-₹{discountAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      {/* Popper arrow */}
                      <div className="absolute -bottom-2 left-8 w-4 h-4 bg-green-50 border-r-2 border-b-2 border-green-300 transform rotate-45"></div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700" style={{ fontSize: '1.5rem' }}>Delivery</span>
                    <span className="text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>{deliveryFee > 0 ? `₹${deliveryFee.toLocaleString()}` : 'Free'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-900 font-bold" style={{ fontSize: '1.8rem' }}>Total</span>
                    <div className="text-right">
                      {isEligibleForDiscount && discountAmount > 0 && (
                        <div className="text-gray-500 line-through text-sm">₹{subtotal.toLocaleString()}</div>
                      )}
                      <span className="text-gray-900 font-bold" style={{ fontSize: '1.8rem' }}>₹{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Cart Editing Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-blue-700 text-sm text-center">
                    <span className="font-semibold">Need to modify your order?</span> You can add, remove, or update quantities in your <Link href="/cart" className="underline hover:text-blue-900">cart</Link>. Changes cannot be made during checkout.
                  </p>
                </div>
                {/* Validation Status */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-red-800 font-medium mb-2" style={{ fontSize: '1.4rem' }}>Please fix the following issues:</h4>
                        <ul className="text-red-700 space-y-1" style={{ fontSize: '1.3rem' }}>
                          {validationErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {validationWarnings.length > 0 && validationErrors.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-yellow-800 font-medium mb-2" style={{ fontSize: '1.4rem' }}>Please note:</h4>
                        <ul className="text-yellow-700 space-y-1" style={{ fontSize: '1.3rem' }}>
                          {validationWarnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleCompletePayment}
                  disabled={isProcessing || isValidatingPayment || !cartData?.items?.length}
                  className={`w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors mt-6 flex items-center justify-center gap-2 ${
                    isProcessing || isValidatingPayment || !cartData?.items?.length ? 'opacity-50 cursor-not-allowed' : ''
                  }`} 
                  style={{ fontSize: '1.6rem' }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : isValidatingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Complete Purchase
                    </>
                  )}
                </button>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-6" style={{ fontSize: '2.2rem' }}>Payment Methods</h2>
                <div className="space-y-6">
                  <p className="text-gray-600" style={{ fontSize: '1.5rem' }}>Choose from multiple secure payment options:</p>
                  <PaymentIcons size="medium" />
                  <div className="flex items-center gap-4 pt-4">
                    <Shield size={20} className="text-gray-900" />
                    <div className="text-gray-700">
                      <p className="font-bold" style={{ fontSize: '1.3rem' }}>100% Secure Payments</p>
                      <p style={{ fontSize: '1.3rem' }}>Powered by Razorpay with 256-bit SSL encryption</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      <AddressForm
        isOpen={showAddressForm}
        onClose={() => {
          setShowAddressForm(false);
          setEditingAddress(null);
        }}
        onSuccess={handleAddressSuccess}
        editAddress={editingAddress}
      />

      {/* Order Creation Loader */}
      <OrderCreationLoader 
        stage={paymentStage}
        message={loadingMessage}
        onRetry={() => {
          if (lastPaymentParams) {
            retryPayment(lastPaymentParams);
          }
        }}
        onCancel={cancelPayment}
      />
    </div>
  );
};

export default CheckoutPage;