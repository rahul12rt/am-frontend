"use client";

import React, { useState } from 'react';
import { CheckCircle, Edit, Plus, CreditCard, Shield, Loader2, User, Mail, Phone } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import { useCart } from '@/hooks/queries/useCart';
import AddressForm from '@/components/organisms/checkout/AddressForm';
import PaymentIcons from '@/components/atoms/PaymentIcons';
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout';
import { type Address } from '@/lib/api-services';
import Image from 'next/image';
import Link from 'next/link';
import { MdKeyboardArrowRight } from 'react-icons/md';

const CheckoutPage = () => {
  const { data: cartData, isLoading: cartLoading } = useCart();
  const { profile } = useUser();
  const { showToast } = useToast();
  const { payNow, isProcessing } = useRazorpayCheckout();

  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>('');
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressType, setAddressType] = useState<'billing' | 'shipping'>('billing');

  // Mock data for now - replace with actual address data
  const addresses: any[] = profile?.addresses || [];
  const deliveryFee = 0;
  const subtotal = cartData?.summary?.totalAmount ? parseFloat(cartData.summary.totalAmount) : 0;
  const total = subtotal + deliveryFee;

  // Handle payment with Razorpay
  const handleCompletePayment = async () => {
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
      name: `${profile.first_name} ${profile.last_name || ''}`.trim(),
      email: profile.email || 'customer@example.com',
      contact: `${profile.phone_country_code}${profile.phone_number}` || '9999999999'
    };

    try {
      await payNow({
        totalAmountInRupees: total,
        itemsSummary: itemsSummary,
        prefill: prefillData
      });
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

  const handleAddressSuccess = (address: Address) => {
    setShowAddressForm(false);
    setEditingAddress(null);
    
    if (address.is_billing_address && addressType === 'billing') {
      setSelectedBillingAddress(address.id);
    }
    if (address.is_shipping_address && (addressType === 'shipping' || useSameAddress)) {
      setSelectedShippingAddress(address.id);
    }
    
    showToast(`Address ${editingAddress ? 'updated' : 'added'} successfully!`, 'success');
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
              <div className="mb-6">
                <h2 className="font-bold text-gray-900" style={{ fontSize: '2.2rem' }}>Profile Information</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="text-gray-600" size={20} />
                  <span className="text-gray-900" style={{ fontSize: '1.5rem' }}>
                    {profile.first_name} {profile.last_name || ''}
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
              {false ? (
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
                  {addresses && addresses.filter(addr => addr.is_shipping_address).length > 0 ? (
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
                    <span className="text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>₹{cartData?.summary?.totalAmount ? parseFloat(cartData.summary.totalAmount).toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700" style={{ fontSize: '1.5rem' }}>Delivery</span>
                    <span className="text-gray-900 font-medium" style={{ fontSize: '1.5rem' }}>{deliveryFee > 0 ? `₹${deliveryFee.toLocaleString()}` : 'Free'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-900 font-bold" style={{ fontSize: '1.8rem' }}>Total</span>
                    <span className="text-gray-900 font-bold" style={{ fontSize: '1.8rem' }}>₹{cartData?.summary?.totalAmount ? (parseFloat(cartData.summary.totalAmount) + deliveryFee).toLocaleString() : '0'}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCompletePayment}
                  disabled={isProcessing || !cartData?.items?.length}
                  className={`w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors mt-6 flex items-center justify-center gap-2 ${
                    isProcessing || !cartData?.items?.length ? 'opacity-50 cursor-not-allowed' : ''
                  }`} 
                  style={{ fontSize: '1.6rem' }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
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
    </div>
  );
};

export default CheckoutPage;