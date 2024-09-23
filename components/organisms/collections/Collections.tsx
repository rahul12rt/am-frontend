import Link from 'next/link';
import { CollectionWatchesTypes } from '@/types';

const Collections = ({ data }: { data: CollectionWatchesTypes[] }) => {
  return (
    <div className='grid grid-cols-1 custom-xsm:grid-cols-1 custom-sm:grid-cols-2 custom-md:grid-cols-4 gap-4'>
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
            <img
              src={product.image}
              alt={product.name}
              className='object-cover mb-6 mt-6 h-[260px]'
            />
            <h2 className='text-[14px] text-gray-400 m-2 text-center max-w-[250px] mx-auto'>
              {product.description}
            </h2>
            <div className='mb-2 text-center'>
              <span className='text-[24px] text-center'>${product.price}</span>
              &nbsp; &nbsp;
              <span className='text-[24px] text-gray-400 line-through font-bold'>
                ${product.originalPrice}
              </span>
              <div className='flex justify-center items-center text-[28px] text-black-1'>
                <img src='/icons/rightArrow.svg' alt='right arrow' />
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Collections;
