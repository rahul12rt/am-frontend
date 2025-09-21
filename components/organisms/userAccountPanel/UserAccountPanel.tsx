"use client";
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, User as UserIcon, MapPin, ShoppingBag, ChevronRight, LogOut } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { UserProfile, Address } from '@/types/user';
import { getOrders } from '@/services/orderService';
import Accordion from '@/components/molecules/accordion/Accordion';

interface UserAccountPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserAccountPanel: React.FC<UserAccountPanelProps> = ({ isOpen, onClose }) => {
  const { profile, logout } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
      
      // Load orders when panel opens
      if (profile) {
        getOrders().then(setOrders).catch(console.error);
      }
    } else {
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 300); // Animation duration
      document.body.style.overflow = 'auto';
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, profile]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isClient || !isMounted || !profile) {
    return null;
  }

  const panelContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity duration-300"
        style={{
          opacity: isOpen ? 1 : 0,
        }}
        onClick={onClose}
      />
      
      {/* Slide Panel */}
      <div
        className="fixed top-0 right-0 h-full bg-black text-white shadow-2xl z-[61] w-full max-w-md border-l border-gray-800 transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <UserIcon className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-bold text-white">Account</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* User Greeting */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-1">
                Hello, {profile.first_name}!
              </h3>
              <p className="text-gray-400">
                +{profile.phone_country_code} {profile.phone_number}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4 mb-8">
              {/* Addresses */}
              <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
                <Accordion 
                  title="Addresses" 
                  icon={<MapPin className="w-5 h-5 text-gray-400" />}
                >
                  {profile.addresses && profile.addresses.length > 0 ? (
                    <div className="space-y-4 p-4">
                      {profile.addresses.map((addr: Address) => (
                        <div key={addr.id} className="p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white text-base">{addr.full_name}</p>
                              {addr.is_default && (
                                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1 text-gray-300 text-sm">
                            <p>{addr.address_line1}</p>
                            {addr.address_line2 && <p>{addr.address_line2}</p>}
                            <p className="font-medium">{addr.city}, {addr.state} - {addr.postal_code}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 p-4">
                      <MapPin className="w-12 h-12 mb-3 text-gray-500" strokeWidth={1.5} />
                      <p className="text-base">No addresses found</p>
                      <p className="text-sm text-gray-500 mt-1">Add your first address during checkout</p>
                    </div>
                  )}
                </Accordion>
              </div>

              {/* Orders */}
              <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
                <Accordion 
                  title="Orders" 
                  icon={<ShoppingBag className="w-5 h-5 text-gray-400" />}
                >
                  {orders.length > 0 ? (
                    <div className="space-y-4 p-4">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-white font-semibold text-base">Order #{order.id}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(order.created_at || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                              order.status === 'processing' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }`}>
                              {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1) || 'Unknown'}
                            </div>
                          </div>
                          {order.total_amount && (
                            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                              <span className="text-gray-400 text-sm">Total Amount</span>
                              <span className="text-white font-semibold">₹{order.total_amount}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {orders.length > 3 && (
                        <div className="text-center pt-2">
                          <p className="text-sm text-gray-400">
                            +{orders.length - 3} more orders
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 p-4">
                      <ShoppingBag className="w-12 h-12 mb-3 text-gray-500" strokeWidth={1.5} />
                      <p className="text-base">No orders yet</p>
                      <p className="text-sm text-gray-500 mt-1">Start shopping to see your orders here</p>
                    </div>
                  )}
                </Accordion>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex justify-between items-center p-4 rounded-lg font-bold text-lg bg-transparent border border-gray-700 text-white hover:bg-gray-800/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
              </div>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(panelContent, document.body);
};

export default UserAccountPanel;
