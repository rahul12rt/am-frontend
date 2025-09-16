"use client";

import React, { useState } from 'react';
import { CheckCircle, Edit, Plus, CreditCard, Shield, Loader2 } from 'lucide-react';
import styles from './Checkout.module.scss';
import { useCart, useCartTotal } from '@/hooks/queries/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useAddresses, useCreateAddress, useUpdateAddress } from '@/hooks/queries/useAddress';
import AddressForm from '@/components/organisms/checkout/AddressForm';
import PaymentIcons from '@/components/atoms/PaymentIcons';
import { useToast } from '@/contexts/ToastContext';
import { type Address } from '@/lib/api-services';
import Image from 'next/image';

const CheckoutPage = () => {
  const { data: cartData, isLoading: cartLoading } = useCart();
  const { data: totalData } = useCartTotal();
  const { user, profile, loading: authLoading } = useAuth();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();

  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const { showToast } = useToast();

  const subtotal = totalData?.subtotal || 0;
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  // Set default address when addresses are loaded
  React.useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(addr => addr.is_default);
      setSelectedAddress(defaultAddr?.id || addresses[0].id);
    }
  }, [addresses, selectedAddress]);

  const handleAddressSuccess = (address: Address) => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setSelectedAddress(address.id);
    showToast(`Address ${editingAddress ? 'updated' : 'added'} successfully!`, 'success');
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  // Show loading state
  if (authLoading || cartLoading) {
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
        <h1 className="text-4xl font-bold mb-8">CHECKOUT</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* My Information */}
            <div className={styles.glassmorphic}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">MY INFORMATION</h2>
                <button className="text-base flex items-center gap-2 hover:text-gray-300"><Edit size={18} /> EDIT</button>
              </div>
              <p className="text-lg font-medium">
                {profile.first_name} {profile.last_name || ''}
              </p>
              <p className="text-base text-gray-400 flex items-center gap-2">
                {profile.email || 'No email provided'}
                {profile.email_verified ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : (
                  <span className="text-sm text-yellow-400">Unverified</span>
                )}
              </p>
              <p className="text-base text-gray-400">
                {profile.phone_number} {profile.phone_verified && <CheckCircle size={16} className="text-green-500 inline" />}
              </p>
            </div>

            {/* Billing Address */}
            <div className={styles.glassmorphic}>
              <h2 className="text-2xl font-bold mb-4">BILLING ADDRESS</h2>
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
                        onClick={() => setSelectedAddress(address.id)}
                        className={`${styles.addressCard} ${selectedAddress === address.id ? styles.selected : ''}`}
                      >
                        <p className="font-bold text-base">
                          {address.full_name}
                          {address.is_default && (
                            <span className="text-sm bg-gray-600 px-2 py-1 rounded-full ml-2">Default</span>
                          )}
                        </p>
                        <p className="text-base">
                          {address.address_line1}
                          {address.address_line2 && `, ${address.address_line2}`}
                        </p>
                        <p className="text-base">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-base">{address.country}</p>
                        {address.landmark && (
                          <p className="text-sm text-gray-400">Landmark: {address.landmark}</p>
                        )}
                      </div>
                    ))}
                  <button
                    onClick={handleAddNewAddress}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-500 rounded-lg py-4 hover:bg-gray-800 transition-colors text-base"
                  >
                    <Plus size={20} /> Add New Address
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No billing addresses found</p>
                  <button
                    onClick={handleAddNewAddress}
                    className={styles.button}
                  >
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>

            {/* Delivery */}
            <div className={styles.glassmorphic}>
              <h2 className="text-2xl font-bold mb-4">DELIVERY</h2>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={useSameAddress} onChange={() => setUseSameAddress(!useSameAddress)} className="h-5 w-5 bg-transparent border-gray-500 rounded" />
                <span className="text-base">Same as my billing address</span>
              </label>
              {!useSameAddress && (
                <div className="mt-4">
                  <p className="text-base text-gray-400">Where would you like your order to be delivered?</p>
                  {/* Add another address selection here */}
                </div>
              )}
            </div>
            
            {/* Payment Methods */}
            <div className={styles.glassmorphic}>
              <h2 className="text-2xl font-bold mb-4">PAYMENT METHODS</h2>
              <div className="space-y-4">
                <p className="text-base text-gray-300">Choose from multiple secure payment options:</p>
                <PaymentIcons size="medium" />
                <div className="flex items-center gap-3 pt-4">
                  <Shield size={24} className="text-green-400" />
                  <div className="text-sm text-gray-400">
                    <p className="font-medium">100% Secure Payments</p>
                    <p>Powered by Razorpay with 256-bit SSL encryption</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${styles.glassmorphic} sticky top-24`}>
              <h2 className="font-bold text-2xl mb-4">ORDER SUMMARY</h2>
              <div className="space-y-4">
                {cartData?.items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-gray-800 rounded-lg overflow-hidden">
                      <Image src={item.watchColor?.Watch?.WatchImages?.front || '/placeholder.png'} alt={item.watchColor?.Watch?.name || ''} width={64} height={80} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold text-base">{item.watchColor?.Watch?.name}</p>
                      <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-base font-medium">₹{(parseFloat(item.price_at_time) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 my-4"></div>
              <div className="space-y-2 text-base">
                <div className="flex justify-between">
                  <span>Order value</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{deliveryFee > 0 ? `₹${deliveryFee.toLocaleString()}` : 'Free'}</span>
                </div>
                <div className="border-t border-gray-700 my-4"></div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              <button className={`${styles.button} mt-6`}>COMPLETE PURCHASE</button>
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