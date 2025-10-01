import React from 'react';
import SkeletonLoader from './SkeletonLoader';

const WatchDetailSkeleton: React.FC = () => {
  return (
    <div className='pt-[90px] pb-[70px] bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen'>
      <div className='container'>
        {/* Breadcrumb Skeleton */}
        <div className='flex items-center text-[14px] pb-[40px] gap-2'>
          <SkeletonLoader width={40} height={16} />
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <SkeletonLoader width={80} height={16} />
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <SkeletonLoader width={120} height={16} />
        </div>

        <div className='py-8'>
          <div className='bg-white rounded-3xl shadow-2xl overflow-hidden'>
            <div className='gap-12 p-8 flex max-[991px]:flex-col max-[991px]:gap-8'>
              
              {/* Image Section Skeleton */}
              <div className='flex gap-4 max-[768px]:flex-col-reverse flex-1'>
                {/* Thumbnail Column */}
                <div className='flex flex-col gap-4 max-[768px]:flex-row'>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className='w-20 h-20 rounded-lg border-2 border-gray-300 overflow-hidden'>
                      <SkeletonLoader width="100%" height="100%" />
                    </div>
                  ))}
                </div>
                
                {/* Main Image */}
                <div className='flex-1 relative'>
                  <div className='aspect-square bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-2xl overflow-hidden border border-gray-200 relative'>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Watch Loading Animation */}
                      <div className="relative">
                        <div className="w-32 h-32 border-4 border-gray-400 border-t-gray-600 rounded-full animate-spin">
                          <div className="absolute top-0 left-1/2 w-2 h-8 bg-gray-600 rounded-full transform -translate-x-1/2"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-white border-4 border-gray-400 rounded-full shadow-inner">
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-8 bg-gray-500 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                      <SkeletonLoader width={30} height={12} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details Skeleton */}
              <div className='flex-1'>
                <div className='pb-4'>
                  {/* Brand */}
                  <SkeletonLoader width={100} height={14} className="mb-1" />
                  
                  {/* Product Name */}
                  <SkeletonLoader width="80%" height={18} className="mb-2" />
                  
                  {/* Description */}
                  <SkeletonLoader width="100%" height={12} className="mb-1" />
                  <SkeletonLoader width="70%" height={12} className="mb-3" />
                  
                  {/* Price Section */}
                  <div className='mb-3'>
                    <div className='flex items-center gap-2 mb-1'>
                      <SkeletonLoader width={30} height={14} />
                      <SkeletonLoader width={120} height={24} />
                    </div>
                    <SkeletonLoader width={150} height={12} />
                  </div>
                </div>

                {/* Variants Section */}
                <div className='mb-6'>
                  <div className='flex items-center gap-2 mb-3'>
                    <SkeletonLoader width={120} height={16} />
                    <SkeletonLoader width={80} height={14} />
                  </div>
                  <div className='space-y-3'>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className='flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200'>
                        <div className='w-16 h-16 rounded-lg overflow-hidden bg-gray-200'>
                          <SkeletonLoader width="100%" height="100%" />
                        </div>
                        <div className='flex-1'>
                          <SkeletonLoader width="60%" height={14} className="mb-1" />
                          <SkeletonLoader width="40%" height={12} />
                        </div>
                        <div className='w-6 h-6 rounded-full border-2 border-gray-300'>
                          <SkeletonLoader variant="circular" width="100%" height="100%" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='mb-6'>
                  <div className='flex gap-3 mb-4'>
                    <SkeletonLoader width="50%" height={48} className="rounded" />
                    <SkeletonLoader width="50%" height={48} className="rounded" />
                  </div>
                </div>

                {/* Features Section */}
                <div className='mb-6'>
                  <SkeletonLoader width={100} height={16} className="mb-3" />
                  <div className='space-y-2'>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className='flex items-center gap-3'>
                        <div className='w-5 h-5 bg-gray-300 rounded'></div>
                        <SkeletonLoader width="70%" height={14} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pincode Checker */}
                <div className='mb-6'>
                  <SkeletonLoader width={150} height={16} className="mb-3" />
                  <div className='flex gap-2'>
                    <SkeletonLoader width="70%" height={40} className="rounded" />
                    <SkeletonLoader width="30%" height={40} className="rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className='border-t border-gray-200'>
              <div className='p-8'>
                <div className='flex gap-6 mb-6'>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonLoader key={index} width={100} height={16} />
                  ))}
                </div>
                <div className='space-y-3'>
                  <SkeletonLoader width="100%" height={16} />
                  <SkeletonLoader width="90%" height={16} />
                  <SkeletonLoader width="95%" height={16} />
                  <SkeletonLoader width="80%" height={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          <div className='mt-12'>
            <SkeletonLoader width={200} height={24} className="mb-6" />
            <div className='grid grid-cols-1 min-[578px]:grid-cols-2 min-[769px]:grid-cols-3 min-[1025px]:grid-cols-4 gap-6'>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className='bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100'>
                  <div className='h-64 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200'>
                    <SkeletonLoader width="100%" height="100%" />
                  </div>
                  <div className='p-4 space-y-3'>
                    <SkeletonLoader width="80%" height={18} />
                    <SkeletonLoader width="60%" height={14} />
                    <SkeletonLoader width="40%" height={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchDetailSkeleton;
