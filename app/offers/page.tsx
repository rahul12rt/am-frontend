'use client';
import Image from 'next/image';
import { fetchWatches, Watch } from '@/data/watches';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const Offers = () => {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatches()
      .then((data) => setWatches(data.filter((w) => w.offerpercentage)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className='pt-[40px] pb-[70px] bg-black-1 text-white-1'>
      <div
        className='bg-no-repeat bg-contain'
        style={{ backgroundImage: 'url("/images/offerBanner.png")' }}
      >
        <div className='container'>
          <div className='grid grid-cols-1 custom-xsm:grid-cols-1 custom-sm:grid-cols-2 custom-md:grid-cols-4 gap-[80px] pt-[140px] max-[768px]:pt-[75px]'>
            {loading ? (
              <div className='text-center text-white-1 w-full'>Loading...</div>
            ) : (
              watches.map((product) => (
                <Link
                  href={`/${product.id}`}
                  className='text-center'
                  key={product.id}
                >
                  <h3 className='text-[2.4rem] leading-[30px] font-bold max-[768px]:text-=[1.8rem] pb-[16px]'>
                    {product.name}
                  </h3>
                  <div className='relative w-[180px] mx-auto'>
                    <Image
                      src={
                        product.WatchImages?.[0]?.isoview ||
                        '/images/am0s1.webp'
                      }
                      width={180}
                      height={181}
                      alt={product.name}
                    />
                    <p className='bg-white-1 text-black-1 text-[1.6rem] font-bold leading-[20px] text-center rounded-full w-[50px] h-[50px] flex items-center justify-center absolute bottom-[35px] right-[5px] max-[768px]:text-=[1.4rem]'>
                      {product.offerpercentage}%
                    </p>
                  </div>
                  <h2 className='text-[14px] text-gray-400 m-2 text-center max-w-[250px] mx-auto'>
                    {product.characteristics}
                  </h2>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offers;
