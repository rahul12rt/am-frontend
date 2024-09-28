import Image from 'next/image';
import Link from 'next/link';
import { CollectionWatchesTypes } from '@/types';

const Collections = ({ data }: { data: CollectionWatchesTypes[] }) => {
  return (
    <div className='grid grid-cols-1 custom-xsm:grid-cols-1 custom-sm:grid-cols-2 custom-md:grid-cols-4 gap-x-4 gap-y-[50px]'>
      {data.map((product) => (
        <div
          key={product.id}
          className='relative rounded-[15px] flex flex-col items-center p-[15px] pt-[20px]'
        >
          <Link
            href={`/collections/${product.id}`}
            className='flex flex-col items-center'
          >
            <div className='px-[15px] py-[8px] rounded-[8px] text-center flex item-center justify-between'>
              <div>
                <h3 className='text-[16px] font-bold'>{product.name}</h3>
              </div>
            </div>
            <div className='relative min-w-full h-[260px]'>
              <Image
                fill
                src={product.image}
                alt={product.name}
                className='object-contain'
              />
            </div>
            <h2 className='text-[14px] text-gray-400 m-2 text-center max-w-[250px] mx-auto'>
              {product.description}
            </h2>
            <div className='mb-2 text-center'>
              <span className='text-[24px] text-center'>${product.price}</span>
              &nbsp; &nbsp;
              <span className='text-[24px] text-gray-400 line-through font-bold'>
                ${product.originalPrice}
              </span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Collections;
