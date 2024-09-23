import Image from 'next/image';
import styles from './Series.module.css';

const seriesData = Array.from({ length: 10 }, (_, index) => ({
  title: `Series ${index + 1}`,
  price: `$${(index + 1) * 100}`,
  imageSrc: `/images/series0${(index % 10) + 1}.png`,
}));

function Series() {
  return (
    <div className='bg-black-1 rounded-bl-[10px] rounded-br-[10px]'>
      <div className='container pt-[90px] pb-[30px]'>
        <div
          className={`flex gap-[20px] overflow-x-auto w-full h-[340px] max-[768px]:h-[200px] pb-[20px] ${styles.cardWrap}`}
        >
          {seriesData.map((series, index) => (
            <div
              key={index}
              className='max-w-[360px] w-full max-[768px]:w-[80%] h-[258px] max-[768px]:h-[135px] bg-white-2 text-black-1 p-[20px] max-[768px]:py-[8px] max-[768px]:px-[12px] rounded-[8px] shrink-0 relative'
            >
              <h3 className='text-[3.2rem] font-bold leading-[40px] pb-[4px] max-[768px]:pb-[0] max-[768px]:text-[2.4rem]'>
                {series.title}
              </h3>
              <p className='text-[1.2rem] leading-[15px]'>
                starting at <span className='text-[16px]'>{series.price}</span>
              </p>
              <div className='absolute right-0 max-[768px]:w-[140px] max-[768px]:h-[140px] max-[768px]:bottom-[-46px]'>
                <Image
                  src='/images/am0s2.webp'
                  width={218}
                  height={219}
                  alt={series.title}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Series;
