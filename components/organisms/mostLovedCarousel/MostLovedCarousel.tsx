'use client';
import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';
import {
  CarouselDotButton,
  useDotButton,
} from '../../atoms/CarouselDotButton/CarouselDotButton';
import NewCollectionWatch from '@/components/molecules/newCollectionWatch/NewCollectionWatch';
import { fetchWatches, Watch } from '@/data/watches';
import styles from './MostLovedCarousel.module.scss';

type PropType = {
  options?: EmblaOptionsType;
};

const MostLovedCarousel: React.FC<PropType> = (props) => {
  const { options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatches()
      .then((data) => setWatches(data.slice(0, 5)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.embla}>
      <div className='overflow-hidden' ref={emblaRef}>
        <div className={`${styles.embla__container} flex`}>
          {loading ? (
            <div className='text-white-1 text-center w-full'>Loading...</div>
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
