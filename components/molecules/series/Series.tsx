'use client';
import { useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './Series.module.css';
import { useWatches } from '@/hooks/queries/useWatches';
import Link from 'next/link';

function Series() {
  const { data: allWatches = [], isLoading: loading, error } = useWatches({ limit: 10 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get first 10 watches for series display
  const seriesWatches = useMemo(() => {
    return allWatches.slice(0, 10);
  }, [allWatches]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Ensure any pending DOM operations are cleaned up
      if (containerRef.current) {
        containerRef.current.style.display = 'none';
      }
    };
  }, []);

  return (
    <div className='bg-black-1 rounded-bl-[10px] rounded-br-[10px]'>
      <div className='container pt-[90px] pb-[30px]'>
        <div
          ref={containerRef}
          className={`flex gap-[20px] overflow-x-auto w-full h-[340px] max-[768px]:h-[200px] pb-[20px] ${styles.cardWrap}`}
        >
          {loading ? (
            <div className='text-white-1 text-center w-full'>Loading...</div>
          ) : error ? (
            <div className='text-red-400 text-center w-full'>Error loading series: {error.message}</div>
          ) : seriesWatches.length === 0 ? (
            <div className='text-gray-400 text-center w-full'>No series available</div>
          ) : (
            seriesWatches.map((series) => (
              <Link
                href={`/${series.id}`}
                key={series.id}
                className='max-w-[360px] w-full max-[768px]:w-[80%] h-[258px] max-[768px]:h-[135px] bg-white-2 text-black-1 p-[20px] max-[768px]:py-[8px] max-[768px]:px-[12px] rounded-[8px] shrink-0 relative'
              >
                <h3 className='text-[3.2rem] font-bold leading-[40px] pb-[4px] max-[768px]:pb-[0] max-[768px]:text-[2.4rem]'>
                  {series.name}
                </h3>
                <p className='text-[1.2rem] leading-[15px]'>
                  starting at{' '}
                  <span className='text-[16px]'>${series.offerprice}</span>
                </p>
                <div className='absolute right-0 max-[768px]:w-[140px] max-[768px]:h-[140px] max-[768px]:bottom-[-46px]'>
                  <Image
                    src={
                      series.WatchImages?.[0]?.isoview ||
                      series.WatchImages?.[0]?.front ||
                      '/images/am0s2.webp'
                    }
                    width={218}
                    height={219}
                    alt={series.name}
                  />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Series;
