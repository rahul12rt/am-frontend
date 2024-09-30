import Link from 'next/link';
import { EmblaOptionsType } from 'embla-carousel';
import MostLovedCarousel from '../mostLovedCarousel/MostLovedCarousel';

const OPTIONS: EmblaOptionsType = { dragFree: true };

const MostLoved = () => {
  return (
    <section>
      <div
        className='h-[288px] bg-contain bg-center bg-no-repeat'
        style={{ backgroundImage: 'url("/images/mostLoved.webp")' }}
      >
        &nbsp;
      </div>

      <div className='container translate-y-[-170px]'>
        <MostLovedCarousel options={OPTIONS} />
        <div className='text-center pt-[14px]'>
          <Link href='/collections' className='text-[1.6rem] leading-[2rem]'>
            View All Collections
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MostLoved;
