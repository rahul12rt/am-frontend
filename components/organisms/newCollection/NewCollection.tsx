'use client';
import { useEffect, useState } from 'react';
import NewCollectionWatch from '@/components/molecules/newCollectionWatch/NewCollectionWatch';
import { useFeaturedWatches } from '@/hooks/queries/useWatches';

const NewCollection = () => {
  const { data: watches = [], isLoading: loading, error } = useFeaturedWatches();
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
  const clampedPositionY = Math.min(-148, Math.max(-160, backgroundPositionY));

  return (
    <section className='pb-[25px]'>
      <div
        className='
          h-[670px] 
          sm:h-[500px] 
          md:h-[600px] 
          lg:h-[670px] 
          xl:h-[750px]
          bg-cover 
          bg-no-repeat 
          bg-center
          relative
          overflow-hidden
        '
        style={{ 
          backgroundImage: 'url("/images/newSection.jpg")',
          backgroundPositionX: 'center',
          backgroundPositionY: `${clampedPositionY}px`,
          backgroundSize: 'cover'
        }}
      >
        <div className='container translate-y-[-50%] px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-end items-center'>
            <div className='
              overflow-hidden 
              w-[66px] 
              sm:w-[70px] 
              md:w-[80px]
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
            '>
              <span>NEW - NEW-</span>
              <span aria-hidden='true'>NEW - NEW-</span>
            </div>
          </div>
        </div>
        
        {/* Responsive overlay for better mobile experience */}
        <div className='absolute inset-0 bg-black bg-opacity-10 sm:bg-opacity-0'></div>
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
