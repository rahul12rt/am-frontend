'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { MdKeyboardArrowRight } from 'react-icons/md';
import Collections from '@/components/organisms/collections/Collections';
import { useWatchCache } from '@/contexts/WatchCacheContext';
import { CollectionsGridSkeleton } from '@/components/ui/SkeletonLoader';
import StructuredData from '@/components/seo/StructuredData';
import Head from 'next/head';
import { trackViewItemList, formatWatchToGAItem } from '@/components/seo/GoogleAnalytics';

const Collection = () => {
  const { allWatches: watches, isLoading: loading, error, isCacheReady } = useWatchCache();

  // Track view_item_list event when watches load
  useEffect(() => {
    if (watches && watches.length > 0 && isCacheReady) {
      // Track first 10 items for performance
      const itemsToTrack = watches.slice(0, 10).map((watch, index) => 
        formatWatchToGAItem(watch, index)
      );
      
      trackViewItemList('collections_all', 'All Watches Collection', itemsToTrack);
    }
  }, [watches, isCacheReady]);

  const breadcrumbData = {
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Collections', url: '/collections' }
    ]
  };

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredData type="breadcrumb" data={breadcrumbData} />
      
      <section className='pt-[90px] pb-[70px] bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen'>
        <div className='container'>
        <div className='flex items-center text-[14px] pb-[40px] gap-2 text-gray-700'>
          <Link href='/' className='opacity-60 hover:opacity-100 hover:text-black transition-colors'>
            Home
          </Link>
          <MdKeyboardArrowRight className="text-gray-400" />
          <span className="font-medium text-black">Collection</span>
        </div>
        {(loading || !isCacheReady) ? (
          <>
            {/* Loading Header */}
            <div className='text-center text-gray-600 mb-8'>
              <div className="inline-flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="text-lg font-medium">
                  {isCacheReady ? 'Loading luxury watches...' : 'Loading from cache...'}
                </span>
              </div>
            </div>
            {/* Skeleton Grid */}
            <CollectionsGridSkeleton count={8} />
          </>
        ) : error ? (
          <div className='text-center text-red-600 py-20'>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="font-medium">Error loading watches</p>
              <p className="text-sm mt-2">{error.message}</p>
            </div>
          </div>
        ) : (
          <Collections data={watches} />
        )}
        </div>
      </section>
    </>
  );
};

export default Collection;
