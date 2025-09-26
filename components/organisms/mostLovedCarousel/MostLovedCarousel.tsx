'use clent';
import { useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';
import {
  CarouselDotButton,
  useDotButton,
} from '../../atoms/CarouselDotButton/CarouselDotButton';
import NewCollectionWatch from '@/components/molecules/newCollectionWatch/NewCollectionWatch';
import { useWatchCache } from '@/contexts/WatchCacheContext';
import styles from './MostLovedCarousel.module.scss';

type PropType = {
  options?: EmblaOptionsType;
};

const MostLovedCarousel: React.FC<PropType> = (props) => {
  const { options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const { allWatches, isLoading: loading, error, isCacheReady } = useWatchCache();
  
  // Get first 5 watches for carousel
  const watches = useMemo(() => {
    return allWatches.slice(0, 5);
  }, [allWatches]);

  return (
    <section className={styles.embla}>
      <div className='overflow-hidden' ref={emblaRef}>
        <div className={`${styles.embla__container} flex`}>
          {(loading || !isCacheReady) ? (
            <div className='text-white-1 text-center w-full'>Loading from cache...</div>
          ) : error ? (
            <div className='text-red-400 text-center w-full'>Error loading watches: {error.message}</div>
          ) : watches.length === 0 ? (
            <div className='text-gray-400 text-center w-full'>No watches available</div>
          ) : (
            watches.map((item, index) => (
              <div className={styles.embla__slide} key={item.id}>
                <div className='relative text-center'>
                  <NewCollectionWatch item={item} />
                  <p className='text-[12rem] absolute bottom-0 left-[20%] leading-[9rem] font-[family-name:var(--font-timesNewRomanNormal)]'>
                    {index + 1}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`${styles.embla__dots} pt-[60px]`}>
        {scrollSnaps.map((_, index) => (
          <CarouselDotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            className={`${styles.embla__dot} ${
              index === selectedIndex ? styles['embla__dot--selected'] : ''
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default MostLovedCarousel;
