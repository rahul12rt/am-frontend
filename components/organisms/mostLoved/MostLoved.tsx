import { EmblaOptionsType } from 'embla-carousel';
import MostLovedCarousel from '../mostLovedCarousel/MostLovedCarousel';

const OPTIONS: EmblaOptionsType = { dragFree: true };

const MostLoved = () => {
  return (
    <section className='pb-[25px]'>
      <div
        className='h-[288px] bg-contain bg-center bg-no-repeat'
        style={{ backgroundImage: 'url("/images/mostLoved.webp")' }}
      >
        &nbsp;
      </div>

      <div className='container translate-y-[-170px]'>
        <MostLovedCarousel options={OPTIONS} />
      </div>
    </section>
  );
};

export default MostLoved;
