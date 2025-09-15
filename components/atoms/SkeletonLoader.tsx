"use client";

import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className = "" }) => {
  return (
    <div className={`h-full flex flex-col bg-black overflow-hidden ${className}`}>
      {/* Header Skeleton */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-800 shrink-0">
        <div className="h-6 w-24 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg animate-pulse backdrop-blur-sm bg-opacity-70"></div>
        <div className="h-8 w-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full animate-pulse backdrop-blur-sm bg-opacity-70"></div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Welcome Message Skeleton */}
          <div className="mb-6 space-y-3">
            <div className="h-8 w-48 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg animate-pulse backdrop-blur-sm bg-opacity-70"></div>
            <div className="h-4 w-32 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg animate-pulse backdrop-blur-sm bg-opacity-50"></div>
          </div>

          {/* Profile Card Skeleton */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-md border border-gray-700/30 rounded-2xl p-6 mb-6 shadow-2xl">
            {/* Avatar Skeleton */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-16 w-16 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full animate-pulse backdrop-blur-sm"></div>
              <div className="space-y-2">
                <div className="h-5 w-24 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg animate-pulse backdrop-blur-sm"></div>
                <div className="h-3 w-32 bg-gradient-to-r from-gray-600 to-gray-500 rounded-lg animate-pulse backdrop-blur-sm"></div>
              </div>
            </div>

            {/* Info Cards Skeleton */}
            <div className="space-y-4">
              {/* Addresses Section */}
              <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/30 backdrop-blur-sm rounded-xl p-4 border border-gray-600/20">
                <div className="h-5 w-20 bg-gradient-to-r from-gray-600 to-gray-500 rounded-lg animate-pulse mb-3 backdrop-blur-sm"></div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg animate-pulse backdrop-blur-sm"></div>
                  <div className="h-3 w-1/2 bg-gradient-to-r from-gray-600 to-gray-500 rounded-lg animate-pulse backdrop-blur-sm"></div>
                </div>
              </div>

              {/* Orders Section */}
              <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/30 backdrop-blur-sm rounded-xl p-4 border border-gray-600/20">
                <div className="h-5 w-16 bg-gradient-to-r from-gray-600 to-gray-500 rounded-lg animate-pulse mb-3 backdrop-blur-sm"></div>
                <div className="space-y-2">
                  <div className="h-4 w-2/3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg animate-pulse backdrop-blur-sm"></div>
                  <div className="h-3 w-1/3 bg-gradient-to-r from-gray-600 to-gray-500 rounded-lg animate-pulse backdrop-blur-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Out Button Skeleton */}
          <div className="h-12 w-full bg-gradient-to-r from-gray-800/60 to-gray-700/40 backdrop-blur-md border border-gray-600/30 rounded-lg animate-pulse shadow-lg"></div>
        </div>
      </div>

      {/* Floating Glassmorphism Elements for Visual Appeal */}
      <div className="absolute top-1/4 left-4 h-20 w-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-8 h-16 w-16 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-xl animate-pulse delay-700"></div>
      <div className="absolute top-1/2 right-4 h-12 w-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
    </div>
  );
};

export default SkeletonLoader;