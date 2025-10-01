"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface WatchImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

const WatchImage: React.FC<WatchImageProps> = ({
  src,
  alt,
  className = '',
  onError,
  priority = false,
  fill = true,
  width,
  height
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div className="relative w-full h-full">
      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 z-10">
          <div className="flex flex-col items-center space-y-4">
            {/* Elegant Watch Loading Animation */}
            <div className="relative">
              {/* Outer ring */}
              <div className="w-20 h-20 border-2 border-gray-300 rounded-full animate-spin">
                <div className="absolute top-0 left-1/2 w-1 h-6 bg-gray-600 rounded-full transform -translate-x-1/2"></div>
              </div>
              {/* Inner watch face */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-full shadow-inner">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1 h-4 bg-gray-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Loading watch</p>
              <div className="flex space-x-1 mt-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 z-10">
          <div className="flex flex-col items-center space-y-3 text-center p-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">Watch Preview</p>
          </div>
        </div>
      )}

      {/* Actual Image */}
      <Image
        src={src}
        alt={alt}
        className={`transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  );
};

export default WatchImage;
