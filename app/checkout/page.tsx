"use client";

import React, { useState } from 'react';
import { CheckCircle, Edit, Plus, CreditCard, Shield, Loader2 } from 'lucide-react';
import styles from './Checkout.module.scss';
import { useCart, useCartTotal } from '@/hooks/queries/useCart';
import { useAuth } from '@/contexts/UserContext';
import { useAddresses, useCreateAddress, useUpdateAddress } from '@/hooks/queries/useAddress';
import AddressForm from '@/components/organisms/checkout/AddressForm';
import PaymentIcons from '@/components/atoms/PaymentIcons';
import { useToast } from '@/contexts/ToastContext';
import { type Address } from '@/lib/api-services';
import Image from 'next/image';

const CheckoutPage = () => {
  const { data: cartData, isLoading: cartLoading } = useCart();
  const { data: totalData } = useCartTotal();
  const { user, profile, loading } = useAuth();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();

  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>('');
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressType, setAddressType] = useState<'billing' | 'shipping'>('billing');
  const { showToast } = useToast();

  const subtotal = totalData?.subtotal || 0;
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

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
  if (loading || cartLoading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg">Loading Checkout...</span>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user || !profile) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to access checkout.</p>
          <button
            onClick={() => window.location.href = '/'}
            className={styles.button}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Show empty cart message
  if (!cartData?.items || cartData.items.length === 0) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-400 mb-6">Add some items to your cart before checkout.</p>
          <button
            onClick={() => window.location.href = '/collections'}
            className={styles.button}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className={styles.pageTitle}>CHECKOUT</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* My Information */}
            <div className={styles.glassmorphic}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={styles.sectionTitle}>MY INFORMATION</h2>
                <button className="text-sm flex items-center gap-2 hover:text-gray-300 transition-colors font-light tracking-wide uppercase">
                  <Edit size={16} /> EDIT
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-lg font-light tracking-wide">
                  {profile.first_name} {profile.last_name || ''}
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-2 font-light">
                  {profile.email || 'No email provided'}
                  {profile.email_verified ? (
                    <CheckCircle size={16} className="text-white" />
                  ) : (
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Unverified</span>
                  )}
                </p>
                <p className="text-sm text-gray-400 font-light">
                  {profile.phone_number} {profile.phone_verified && <CheckCircle size={14} className="text-white inline ml-1" />}
                </p>
              </div>
            </div>

            {/* Billing Address */}
            <div className={styles.glassmorphic}>
              <h2 className={styles.sectionTitle}>BILLING ADDRESS</h2>
              {addressesLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading addresses...</span>
                </div>
              ) : addresses && addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses
                    .filter(address => address.is_billing_address)
                    .map(address => (
                      <div
                        key={address.id}
                        onClick={() => setSelectedBillingAddress(address.id.toString())}
                        className={`${styles.addressCard} ${selectedBillingAddress === address.id.toString() ? styles.selected : ''}`}
                      >
                        <div className="space-y-2">
                          <p className="font-light text-base tracking-wide">
                            {address.full_name}
                            {address.is_default && (
                              <span className="text-xs bg-white text-black px-2 py-1 ml-2 uppercase tracking-wider">Default</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-300 font-light">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-gray-300 font-light">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-sm text-gray-300 font-light">{address.country}</p>
                          {address.landmark && (
                            <p className="text-xs text-gray-500 font-light">Landmark: {address.landmark}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  <button
                    onClick={() => handleAddNewAddress('billing')}
                    className={styles.addAddressButton}
                  >
                    <Plus size={20} /> Add New Address
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No billing addresses found</p>
                  <button
                    onClick={() => handleAddNewAddress('billing')}
                    className={styles.button}
                  >
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>

            {/* Delivery */}
            <div className={styles.glassmorphic}>
              <h2 className={styles.sectionTitle}>DELIVERY</h2>
              <label className="flex items-center gap-4 mb-6">
                <input 
                  type="checkbox" 
                  checked={useSameAddress} 
                  onChange={() => setUseSameAddress(!useSameAddress)} 
                  className={styles.checkbox}
                />
                <span className="text-sm font-light tracking-wide">Same as my billing address</span>
              </label>
              {!useSameAddress && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400 font-light mb-4">Select a different shipping address:</p>
                  {addresses && addresses.filter(addr => addr.is_shipping_address).length > 0 ? (
                    <div className="space-y-3">
                      {addresses
                        .filter(address => address.is_shipping_address)
                        .map(address => (
                          <div
                            key={address.id}
                            onClick={() => setSelectedShippingAddress(address.id.toString())}
                            className={`${styles.addressCard} ${selectedShippingAddress === address.id.toString() ? styles.selected : ''}`}
                          >
                            <div className="space-y-2">
                              <p className="font-light text-base tracking-wide">
                                {address.full_name}
                                {address.is_default && (
                                  <span className="text-xs bg-white text-black px-2 py-1 ml-2 uppercase tracking-wider">Default</span>
                                )}
                              </p>
                              <p className="text-sm text-gray-300 font-light">
                                {address.address_line1}
                                {address.address_line2 && `, ${address.address_line2}`}
                              </p>
                              <p className="text-sm text-gray-300 font-light">
                                {address.city}, {address.state} {address.postal_code}
                              </p>
                              <p className="text-sm text-gray-300 font-light">{address.country}</p>
                              {address.landmark && (
                                <p className="text-xs text-gray-500 font-light">Landmark: {address.landmark}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      <button
                        onClick={() => handleAddNewAddress('shipping')}
                        className={styles.addAddressButton}
                      >
                        <Plus size={20} /> Add New Shipping Address
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-400 mb-4 font-light">No shipping addresses found</p>
                      <button
                        onClick={() => handleAddNewAddress('shipping')}
                        className={styles.button}
                      >
                        Add Shipping Address
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Payment Methods */}
            <div className={styles.glassmorphic}>
              <h2 className={styles.sectionTitle}>PAYMENT METHODS</h2>
              <div className="space-y-6">
                <p className="text-sm text-gray-300 font-light tracking-wide">Choose from multiple secure payment options:</p>
                <PaymentIcons size="medium" />
                <div className="flex items-center gap-4 pt-4">
                  <Shield size={20} className="text-white" />
                  <div className="text-xs text-gray-400">
                    <p className="font-light tracking-wide uppercase">100% Secure Payments</p>
                    <p className="font-light">Powered by Razorpay with 256-bit SSL encryption</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${styles.glassmorphic} ${styles.orderSummary}`}>
              <h2 className={styles.sectionTitle}>ORDER SUMMARY</h2>
              <div className="space-y-3 mb-6">
                {cartData?.items.map(item => (
                  <div key={item.id} className={styles.productItem}>
                    <div className="flex gap-3 items-center">
                      <div className="w-14 h-16 bg-black border border-gray-800 overflow-hidden">
                        <Image 
                          src={item.watchColor?.Watch?.WatchImages?.[0]?.front || '/placeholder.png'} 
                          alt={item.watchColor?.Watch?.name || ''} 
                          width={56} 
                          height={64} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-light text-sm tracking-wide">{item.watchColor?.Watch?.name}</p>
                        <p className="text-xs text-gray-500 font-light">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-light tracking-wide">₹{(parseFloat(item.price_at_time) * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <div className={styles.summaryItem}>
                  <span>Order value</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Delivery</span>
                  <span>{deliveryFee > 0 ? `₹${deliveryFee.toLocaleString()}` : 'Free'}</span>
                </div>
                <div className={styles.summaryTotal}>
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <button className={`${styles.button} mt-8`}>COMPLETE PURCHASE</button>
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