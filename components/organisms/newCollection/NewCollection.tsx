'use client';
import { useEffect, useState } from 'react';
import NewCollectionWatch from '@/components/molecules/newCollectionWatch/NewCollectionWatch';
import { useWatchCache } from '@/contexts/WatchCacheContext';

const NewCollection = () => {
  const { getFeaturedWatches, isLoading: loading, error, isCacheReady } = useWatchCache();
  const watches = getFeaturedWatches();
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Calculate background position based on scroll
  // Reduce parallax effect on mobile for better performance
  const scrollFactor = isMobile ? 0.3 : 1; // Slower on mobile
  const backgroundPositionY = -160 + (scrollY * scrollFactor);


  return (
    <section className='pb-[25px]'>
      <div
        className='
          relative
          w-full
          h-[100vh]
          sm:h-[80vh]
          md:h-[70vh]
          lg:h-[100vh]
          xl:h-[100vh]
          max-[768px]:h-[30vh]
          bg-center
          bg-no-repeat
        '
        style={{ 
          backgroundImage: 'url("/images/newSection.jpg")',
          backgroundSize: isMobile ? 'contain' : 'cover',
          backgroundPosition: isMobile ? 'center' : 'center 90%',
        }}
      >
        {/* Linear gradient black to black top to bottom 50% to 20% opacity */}
        <div className='absolute inset-0 bg-gradient-to-b from-black/50 to-black/20'></div>
        
        {/* 10% OFF Marquee - Top Right */}
        <div className='absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8'>
          <div className='
            overflow-hidden 
            w-[80px] 
            sm:w-[90px] 
            md:w-[100px]
            whitespace-nowrap 
            flex 
            items-center 
            leading-[12px] 
            marquee 
            bg-white-1 
            text-black-1 
            text-[0.9rem] 
            sm:text-[1rem] 
            md:text-[1.1rem]
            font-bold 
            rounded-[4px] 
            py-[6px] 
            px-[8px]
            shadow-lg
          '
          >
            <span>10% OFF - 10% OFF-</span>
            <span>10% OFF - 10% OFF-</span>
          </div>
        </div>
        
        {/* Centered Main Text */}
        <div className='absolute inset-0 flex justify-center'>
          <div className='text-center text-white px-4 py-[40px]'>
            <h2 className='text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] font-[family-name:var(--font-ppeditorialnewitalic)] mb-4 leading-tight'>
              10% OFF
            </h2>
            <p className='text-[1rem] sm:text-[1.2rem] md:text-[1.4rem] font-medium opacity-90'>
               On Your First Luxury Purchase
            </p>
          </div>
        </div>
      </div>

      {/* <div className='container py-[80px] max-[768px]:pb-[0px]'>
        {loading ? (
          <div className='text-center text-white-1'>Loading...</div>
        ) : error ? (
          <div className='text-center text-red-400'>Error loading featured watches: {error.message}</div>
        ) : watches.length === 0 ? (
          <div className='text-center text-gray-400'>No featured watches available</div>
        ) : (
          <div className='flex justify-between items-center text-center gap-[30px] max-[768px]:flex-wrap max-[768px]:justify-center max-[768px]:gap-[50px]'>
            {watches.map((item) => (
              <NewCollectionWatch key={item.id} item={item} />
            ))}
          </div>
        )}
      </div> */}
    </section>
  );
};

export default NewCollection;
