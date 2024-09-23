import Link from 'next/link';
import Image from 'next/image';
import { WatchItemNewCollection } from '@/types';

const NewCollectionWatch = ({ item }: { item: WatchItemNewCollection }) => {
  return (
    <Link href='/' key={item.title}>
      <h3 className='text-[2.4rem] font-bold text-white-1 pb-[3px]'>
        {item.title}
      </h3>
      <p className='text-[1.6rem] pb-[16px]'>{item.description}</p>
      <Image
        src={item.imageSrc}
        width={234}
        height={307}
        alt='alban marcus'
      />
    </Link>
  );
};

export default NewCollectionWatch;
