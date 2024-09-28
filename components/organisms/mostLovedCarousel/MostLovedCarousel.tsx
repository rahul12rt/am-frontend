'use client';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';
import { DotButton, useDotButton } from '../../atoms/CarouselDotButton/CarouselDotButton';
import NewCollectionWatch from '@/components/molecules/newCollectionWatch/NewCollectionWatch';
import { mostLovedItems } from '@/data/watches';
import styles from './EmblaCarousel.module.scss';

type PropType = {
  options?: EmblaOptionsType;
};

const MostLovedCarousel: React.FC<PropType> = (props) => {
  const { options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  return (
    <section className={styles.embla}>
      <div className='overflow-hidden' ref={emblaRef}>
        <div className={`${styles.embla__container} flex`}>
          {mostLovedItems.map((item, index) => (
            <div className={styles.embla__slide} key={index}>
              <div key={index} className='relative text-center'>
                <NewCollectionWatch item={item} />
                <p className='text-[12rem] absolute bottom-0 left-[20%] leading-[9rem] font-[family-name:var(--font-timesNewRomanNormal)]'>
                  {index + 1}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.embla__dots} pt-[60px]`}>
        {scrollSnaps.map((_, index) => (
          <DotButton
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
