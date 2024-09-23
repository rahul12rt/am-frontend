import NewCollectionWatch from '@/components/molecules/newCollectionWatch/NewCollectionWatch';
import { collectionItems } from '@/data/watches';

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
        <div className='flex justify-between items-center text-center gap-[30px] wrap'>
          {collectionItems.map((item, index) => (
            <div key={index} className='relative'>
              <NewCollectionWatch item={item} />
              <p className='text-[12rem] leading-[138px] absolute left-0 bottom-[-32px] font-[family-name:var(--font-timesNewRomanNormal)]'>
                {index + 1}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MostLoved;
