"use client";
import React from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import User from '@/components/molecules/user/User';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  message?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = "Login Required",
  message = "Please sign in to continue with your purchase"
}) => {
  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced Backdrop with stronger opacity */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-lg"
        onClick={onClose}
      />
      
      {/* Enhanced Modal with Split Layout - Much larger and more visible */}
      <div 
        className="relative w-full max-w-6xl min-h-[80vh] bg-black border-2 border-white/30 rounded-2xl shadow-2xl overflow-hidden flex"
        style={{ 
          backgroundColor: '#000000',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
        }}
      >
        
        {/* Left Side - Image (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 lg:w-2/5 relative overflow-hidden">
          <Image
            src="/images/login_pop_up_image_left_side.jpg"
            alt="Alban Marcus"
            fill
            className="object-cover"
            priority
          />
          
          {/* Image Overlay with stronger contrast */}
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-end p-8">
            <div className="text-white">
              <h3 className="text-3xl font-bold mb-3 tracking-wider">ALBAN MARCUS</h3>
              <p className="text-white text-[1.4rem] leading-relaxed font-medium">
                Premium timepieces for the discerning collector
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form with stronger background */}
        <div 
          className="w-full md:w-1/2 lg:w-3/5 flex flex-col bg-gray-900"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          {/* Enhanced Header with better contrast */}
          <div className="flex items-center justify-between p-8 border-b-2 border-gray-700">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              {message && (
                <p className="text-[1.4rem] text-gray-200 leading-relaxed font-medium">{message}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-all duration-200 p-3 rounded-full hover:bg-gray-800 ml-4 border border-gray-600 hover:border-gray-400"
            >
              <X className="w-7 h-7" />
            </button>
          </div>
          
          {/* User Component Container with enhanced styling */}
          <div className="flex-1 overflow-y-auto bg-gray-900" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="p-2">
              <User onClose={handleSuccess} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
