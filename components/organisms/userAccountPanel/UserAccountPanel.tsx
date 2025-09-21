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
        className="fixed top-0 right-0 h-full backgroundWhite shadow-2xl z-[61] w-full md:w-[40%] transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <UserIcon className="w-7 h-7 text-gray-600" />
            <h2 className="font-bold text-gray-900" style={{ fontSize: '2.2rem' }}>Account</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* User Greeting */}
            <div className="mb-8 bg-gray-50 rounded-3xl p-6">
              <h3 className="font-bold text-gray-900 mb-3" style={{ fontSize: '2rem' }}>
                Hello, {profile.first_name} {profile.last_name || ''}!
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700 flex items-center gap-2" style={{ fontSize: '1.5rem' }}>
                  <span className="font-medium">Phone:</span>
                  +{profile.phone_country_code} {profile.phone_number}
                </p>
                {profile.email && (
                  <p className="text-gray-700 flex items-center gap-2" style={{ fontSize: '1.5rem' }}>
                    <span className="font-medium">Email:</span>
                    {profile.email}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6 mb-8">
              {/* Addresses */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <Accordion 
                  title="Addresses" 
                  icon={<MapPin className="w-6 h-6 text-gray-600" />}
                >
                  {profile.addresses && profile.addresses.length > 0 ? (
                    <div className="space-y-4 p-6">
                      {profile.addresses.map((addr: Address) => (
                        <div key={addr.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-gray-900" style={{ fontSize: '1.5rem' }}>{addr.full_name}</p>
                              {addr.is_default && (
                                <span className="px-3 py-1 text-xs bg-gray-900 text-white rounded-full font-bold uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1 text-gray-700">
                            <p style={{ fontSize: '1.3rem' }}>{addr.address_line1}</p>
                            {addr.address_line2 && <p style={{ fontSize: '1.3rem' }}>{addr.address_line2}</p>}
                            <p className="font-medium" style={{ fontSize: '1.3rem' }}>{addr.city}, {addr.state} - {addr.postal_code}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-600 p-6">
                      <MapPin className="w-16 h-16 mb-4 text-gray-400" strokeWidth={1.5} />
                      <p style={{ fontSize: '1.5rem' }} className="font-medium">No addresses found</p>
                      <p style={{ fontSize: '1.3rem' }} className="text-gray-500 mt-2">Add your first address during checkout</p>
                    </div>
                  )}
                </Accordion>
              </div>

              {/* Orders */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <Accordion 
                  title="Orders" 
                  icon={<ShoppingBag className="w-6 h-6 text-gray-600" />}
                >
                  {orders.length > 0 ? (
                    <div className="space-y-4 p-6">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-gray-900 font-bold" style={{ fontSize: '1.5rem' }}>Order #{order.id}</p>
                              <p className="text-gray-600" style={{ fontSize: '1.3rem' }}>
                                {new Date(order.created_at || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              'bg-gray-100 text-gray-800 border border-gray-200'
                            }`} style={{ fontSize: '1.3rem' }}>
                              {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1) || 'Unknown'}
                            </div>
                          </div>
                          {order.total_amount && (
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                              <span className="text-gray-600" style={{ fontSize: '1.3rem' }}>Total Amount</span>
                              <span className="text-gray-900 font-bold" style={{ fontSize: '1.5rem' }}>₹{order.total_amount}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {orders.length > 3 && (
                        <div className="text-center pt-4">
                          <p className="text-gray-600" style={{ fontSize: '1.3rem' }}>
                            +{orders.length - 3} more orders
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-600 p-6">
                      <ShoppingBag className="w-16 h-16 mb-4 text-gray-400" strokeWidth={1.5} />
                      <p style={{ fontSize: '1.5rem' }} className="font-medium">No orders yet</p>
                      <p style={{ fontSize: '1.3rem' }} className="text-gray-500 mt-2">Start shopping to see your orders here</p>
                    </div>
                  )}
                </Accordion>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex justify-between items-center p-4 rounded-2xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: '1.6rem' }}
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-6 h-6" />
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
