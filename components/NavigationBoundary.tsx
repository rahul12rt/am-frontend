"use client";

import React, { Suspense, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface NavigationBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const LoadingFallback = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-black-1 p-6 rounded-lg flex items-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-white" />
      <span className="text-white">Loading...</span>
    </div>
  </div>
);

const NavigationBoundary: React.FC<NavigationBoundaryProps> = ({ 
  children, 
  fallback = <LoadingFallback /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default NavigationBoundary;
