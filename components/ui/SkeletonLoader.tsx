import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = '20px',
  animate = true
}) => {
  const baseClasses = `relative overflow-hidden bg-gray-200 ${
    animate ? 'shimmer' : ''
  }`;
  
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded-md'
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {animate && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      )}
    </div>
  );
};

// Watch Card Skeleton Component
export const WatchCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-pulse">
      {/* Image Section Skeleton */}
      <div className="relative h-96 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 bg-gray-300 rounded-full opacity-50"></div>
        </div>
        
        {/* Badges Skeleton */}
        <div className="absolute top-4 left-4">
          <SkeletonLoader width={80} height={24} className="rounded-full" />
        </div>
        <div className="absolute top-4 right-4">
          <SkeletonLoader width={70} height={24} className="rounded-full" />
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title and Price */}
        <div className="border-b border-gray-100 pb-3">
          <div className="flex justify-between items-start mb-2">
            <SkeletonLoader width="60%" height={32} />
            <SkeletonLoader width="30%" height={32} />
          </div>
          <SkeletonLoader width="40%" height={16} className="mb-2" />
          <div className="flex justify-between items-center">
            <SkeletonLoader width="35%" height={20} />
            <SkeletonLoader width="25%" height={16} />
          </div>
        </div>

        {/* Features Skeleton */}
        <div className="flex gap-2">
          <SkeletonLoader width={80} height={32} className="rounded-full" />
          <SkeletonLoader width={90} height={32} className="rounded-full" />
          <SkeletonLoader width={70} height={32} className="rounded-full" />
        </div>

        {/* Savings Skeleton */}
        <SkeletonLoader width="100%" height={40} className="rounded-lg" />
      </div>
    </div>
  );
};

// Collections Grid Skeleton
export const CollectionsGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 min-[578px]:grid-cols-2 min-[769px]:grid-cols-3 min-[1025px]:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <WatchCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
