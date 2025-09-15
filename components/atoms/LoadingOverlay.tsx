"use client";

import React from 'react';

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = "Loading your profile...",
  className = ""
}) => {
  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm ${className}`}>
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-lg border border-gray-700/30 rounded-2xl p-6 shadow-2xl">
        {/* Animated Loading Spinner */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin animate-reverse delay-150"></div>
          </div>

          {/* Loading Message */}
          <div className="text-center">
            <p className="text-white text-sm font-medium mb-1">{message}</p>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;