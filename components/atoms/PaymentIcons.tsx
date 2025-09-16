'use client';

import React from 'react';

interface PaymentIconsProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const PaymentIcons: React.FC<PaymentIconsProps> = ({ size = 'medium', className = '' }) => {
  const iconSizes = {
    small: 'w-8 h-6',
    medium: 'w-12 h-8',
    large: 'w-16 h-12'
  };

  const iconSize = iconSizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* UPI */}
      <div className={`${iconSize} bg-white rounded-md flex items-center justify-center p-1`}>
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <defs>
            <linearGradient id="upiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6600" />
              <stop offset="100%" stopColor="#FF9933" />
            </linearGradient>
          </defs>
          <rect width="100" height="50" rx="4" fill="url(#upiGradient)" />
          <text x="50" y="32" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">UPI</text>
        </svg>
      </div>

      {/* Google Pay */}
      <div className={`${iconSize} bg-white rounded-md flex items-center justify-center p-1`}>
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <rect width="100" height="50" rx="4" fill="#4285f4" />
          <circle cx="25" cy="25" r="8" fill="#34a853" />
          <circle cx="50" cy="25" r="8" fill="#fbbc05" />
          <circle cx="75" cy="25" r="8" fill="#ea4335" />
        </svg>
      </div>

      {/* PhonePe */}
      <div className={`${iconSize} bg-white rounded-md flex items-center justify-center p-1`}>
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <rect width="100" height="50" rx="4" fill="#5f259f" />
          <text x="50" y="32" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">PhonePe</text>
        </svg>
      </div>

      {/* Paytm */}
      <div className={`${iconSize} bg-white rounded-md flex items-center justify-center p-1`}>
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <rect width="100" height="50" rx="4" fill="#00baf2" />
          <text x="50" y="32" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial">Paytm</text>
        </svg>
      </div>

      {/* Visa Card */}
      <div className={`${iconSize} bg-white rounded-md flex items-center justify-center p-1 border`}>
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <rect width="100" height="50" rx="4" fill="white" />
          <text x="50" y="32" textAnchor="middle" fill="#1a1f71" fontSize="12" fontWeight="bold" fontFamily="Arial">VISA</text>
        </svg>
      </div>

      {/* Mastercard */}
      <div className={`${iconSize} bg-white rounded-md flex items-center justify-center p-1`}>
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <rect width="100" height="50" rx="4" fill="white" />
          <circle cx="35" cy="25" r="12" fill="#eb001b" />
          <circle cx="65" cy="25" r="12" fill="#f79e1b" />
          <path d="M35 13 A12 12 0 0 1 65 13 A12 12 0 0 1 65 37 A12 12 0 0 1 35 37 A12 12 0 0 1 35 13" fill="#ff5f00" />
        </svg>
      </div>

      {/* RuPay */}
      <div className={`${iconSize} bg-white rounded-md flex items-center justify-center p-1 border`}>
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <rect width="100" height="50" rx="4" fill="#0066cc" />
          <text x="50" y="32" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">RuPay</text>
        </svg>
      </div>

      {/* Net Banking */}
      <div className={`${iconSize} bg-white rounded-md flex items-center justify-center p-1 border`}>
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <rect width="100" height="50" rx="4" fill="#2c5aa0" />
          <rect x="15" y="15" width="70" height="3" fill="white" />
          <rect x="20" y="22" width="60" height="2" fill="white" />
          <rect x="20" y="27" width="60" height="2" fill="white" />
          <rect x="20" y="32" width="60" height="2" fill="white" />
          <text x="50" y="44" textAnchor="middle" fill="white" fontSize="7" fontFamily="Arial">NET BANKING</text>
        </svg>
      </div>

      {/* American Express */}
      <div className={`${iconSize} bg-white rounded-md flex items-center justify-center p-1 border`}>
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <rect width="100" height="50" rx="4" fill="#006fcf" />
          <text x="50" y="30" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">AMEX</text>
        </svg>
      </div>

      {/* Wallets */}
      <div className={`${iconSize} bg-white rounded-md flex items-center justify-center p-1 border`}>
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <rect width="100" height="50" rx="4" fill="#ff6b35" />
          <rect x="20" y="15" width="60" height="20" rx="3" fill="white" />
          <circle cx="70" cy="25" r="3" fill="#ff6b35" />
          <text x="50" y="42" textAnchor="middle" fill="white" fontSize="8" fontFamily="Arial">WALLET</text>
        </svg>
      </div>
    </div>
  );
};

export default PaymentIcons;