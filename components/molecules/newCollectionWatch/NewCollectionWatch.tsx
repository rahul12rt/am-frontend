import Link from 'next/link';
import Image from 'next/image';
import { Watch } from '@/data/watches';

const NewCollectionWatch = ({ item }: { item: Watch }) => {
  const imageSrc =
    item.WatchImages?.[0]?.isoview ||
    item.WatchImages?.[0]?.front ||
    '/images/am0s1.webp';
  return (
    <Link href={`/${item.id}`} key={item.id}>
      <h3 className='text-[2.4rem] font-bold text-white-1 pb-[3px]'>
        {item.name}
      </h3>
      <p className='text-[1.6rem] pb-[16px]'>{item.description}</p>
      <Image
        src={imageSrc}
        width={234}
        height={307}
        alt={item.name}
        className='mx-auto'
      />
    </Link>
  );
};

export default NewCollectionWatch;
