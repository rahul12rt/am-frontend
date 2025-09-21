'use client';
import Link from 'next/link';
import { MdKeyboardArrowRight } from 'react-icons/md';
import Collections from '@/components/organisms/collections/Collections';
import { useWatchCache } from '@/contexts/WatchCacheContext';

const Collection = () => {
  const { allWatches: watches, isLoading: loading, error, isCacheReady } = useWatchCache();

  return (
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
          <div className='text-center text-gray-600 py-20'>
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="text-lg font-medium">
                {isCacheReady ? 'Loading luxury watches...' : 'Loading from cache...'}
              </span>
            </div>
          </div>
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
  );
};

export default Collection;
