"use client";

import React, { useState } from 'react';
import { CheckCircle, Edit, Plus, CreditCard, Shield } from 'lucide-react';
import styles from './Checkout.module.scss';
import { useCart, useCartTotal } from '@/hooks/queries/useCart';
import Image from 'next/image';

const CheckoutPage = () => {
  const { data: cartData } = useCart();
  const { data: totalData } = useCartTotal();

  const [addresses, setAddresses] = useState([
    { id: 1, name: 'John Doe', line1: '123 Main Street', city: 'New York', state: 'NY', zip: '10001', country: 'USA', isDefault: true },
    { id: 2, name: 'John Doe', line1: '456 Business Ave', city: 'Los Angeles', state: 'CA', zip: '90210', country: 'USA', isDefault: false },
  ]);
  const [selectedAddress, setSelectedAddress] = useState(addresses.find(a => a.isDefault)?.id || 1);
  const [useSameAddress, setUseSameAddress] = useState(true);

  const subtotal = totalData?.subtotal || 0;
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-black text-white min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">CHECKOUT</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* My Information */}
            <div className={styles.glassmorphic}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">MY INFORMATION</h2>
                <button className="text-sm flex items-center gap-2 hover:text-gray-300"><Edit size={16} /> EDIT</button>
              </div>
              <p>Sharan KM</p>
              <p className="text-gray-400 flex items-center gap-2">sharan.ux@gmail.com <CheckCircle size={16} className="text-green-500" /></p>
            </div>

            {/* Billing Address */}
            <div className={styles.glassmorphic}>
              <h2 className="text-xl font-bold mb-4">BILLING ADDRESS</h2>
              <div className="space-y-4">
                {addresses.map(address => (
                  <div key={address.id} onClick={() => setSelectedAddress(address.id)} className={`${styles.addressCard} ${selectedAddress === address.id ? styles.selected : ''}`}>
                    <p className="font-bold">{address.name} {address.isDefault && <span className="text-xs bg-gray-600 px-2 py-1 rounded-full ml-2">Default</span>}</p>
                    <p>{address.line1}, {address.city}, {address.state} {address.zip}</p>
                    <p>{address.country}</p>
                  </div>
                ))}
                <button className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-500 rounded-lg py-4 hover:bg-gray-800 transition-colors">
                  <Plus size={20} /> Add New Address
                </button>
              </div>
            </div>

            {/* Delivery */}
            <div className={styles.glassmorphic}>
              <h2 className="text-xl font-bold mb-4">DELIVERY</h2>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={useSameAddress} onChange={() => setUseSameAddress(!useSameAddress)} className="h-4 w-4 bg-transparent border-gray-500 rounded" />
                <span>Same as my billing address</span>
              </label>
              {!useSameAddress && (
                <div className="mt-4">
                  <p className="text-gray-400">Where would you like your order to be delivered?</p>
                  {/* Add another address selection here */}
                </div>
              )}
            </div>
            
            {/* Payment Methods */}
            <div className={styles.glassmorphic}>
              <h2 className="text-xl font-bold mb-4">PAYMENT METHODS</h2>
              <div className="flex gap-4">
                <CreditCard size={32} />
                <Shield size={32} />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${styles.glassmorphic} sticky top-24`}>
              <h2 className="font-bold text-xl mb-4">ORDER SUMMARY</h2>
              <div className="space-y-4">
                {cartData?.items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-gray-800 rounded-lg overflow-hidden">
                      <Image src={item.watchColor?.Watch?.WatchImages[0]?.front || '/placeholder.png'} alt={item.watchColor?.Watch?.name || ''} width={64} height={80} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold">{item.watchColor?.Watch?.name}</p>
                      <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p>₹{(parseFloat(item.price_at_time) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 my-4"></div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order value</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{deliveryFee > 0 ? `₹${deliveryFee.toLocaleString()}` : 'Free'}</span>
                </div>
                <div className="border-t border-gray-700 my-4"></div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              <button className={`${styles.button} mt-6`}>COMPLETE PURCHASE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;