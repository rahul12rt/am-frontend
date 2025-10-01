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
  
  // Specific watch color IDs for Most Loved section
  const mostLovedColorIds = [
    'a54b336d-89a2-448d-a996-87eb322ea92e',
    'a5f5480a-1210-4cb6-9fb5-f5452f63a79d',
    '5fe51fa5-eac7-40f5-9ec9-4d1e45696363',
    '24278931-0215-428d-8c93-3ce6405224c2',
    '4d1a160e-a91d-4064-8a55-4c48c850c0d6'
  ];
  
  // Get watches by specific color IDs
  const watches = useMemo(() => {
    const filteredWatches = [];
    
    for (const colorId of mostLovedColorIds) {
      // Find watch that has this color ID
      const watchWithColor = allWatches.find(watch => 
        watch.WatchColors && watch.WatchColors.some((color: any) => color.id === colorId)
      );
      
      if (watchWithColor) {
        // Create a watch object with the specific color as the first/primary color
        const specificColor = watchWithColor.WatchColors.find((color: any) => color.id === colorId);
        if (specificColor) {
          filteredWatches.push({
            ...watchWithColor,
            // Put the specific color first so NewCollectionWatch uses it
            WatchColors: [specificColor, ...watchWithColor.WatchColors.filter((color: any) => color.id !== colorId)],
            selectedColorId: colorId
          });
        }
      }
    }
    
    return filteredWatches;
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
                  <p className='text-[12rem] absolute bottom-0 lg:left-[20%] [max-width:786px]:left-[5%]  leading-[9rem] font-[family-name:var(--font-timesNewRomanNormal)]'>
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
