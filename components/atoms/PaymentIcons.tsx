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
      <>
         <img src="/images/paymentsUpdated.svg" alt="UPI" />
      </>
  );
};

export default PaymentIcons;