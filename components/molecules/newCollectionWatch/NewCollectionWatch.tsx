import Link from 'next/link';
import Image from 'next/image';
import { Watch } from '@/lib/api-services';

const NewCollectionWatch = ({ item }: { item: Watch }) => {
  // Get the first watch color's isometric image, fallback to front view or default
  const imageSrc =
    item.WatchColors?.[0]?.WatchImage?.[0]?.isoview ||
    item.WatchColors?.[0]?.WatchImage?.[0]?.front ||
    item.WatchImages?.[0]?.isoview ||
    item.WatchImages?.[0]?.front ||
    '/images/am0s1.webp';
  
  // Helper function to safely extract description as string
  const getDescriptionString = (description: string | { [key: string]: any } | undefined): string => {
    if (!description) return '';
    if (typeof description === 'string') return description;
    if (typeof description === 'object') {
      // If it's an object, try to extract a meaningful string representation
      // You might need to adjust this based on your actual object structure
      return description.text || description.content || description.description || JSON.stringify(description);
    }
    return '';
  };
  
  const truncateText = (text: string, maxLength = 60) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <Link href={`/collections/${item.id}`} key={item.id}>
      <h3 className='text-[2.4rem] font-bold text-white-1 pb-[3px]'>
        {item.name}
      </h3>
      <p className='text-[1.6rem] pb-[16px] leading-relaxed'>
        {truncateText(getDescriptionString(item?.description))}
      </p>
      <Image
        src={imageSrc}
        width={234}
        height={307}
        alt={item.name}
        className='mx-auto scale145'
        sizes="(max-width: 768px) 50vw, 234px"
        quality={85} // High quality for featured products
        priority={false} // Not critical for initial page load
      />
    </Link>
  );
};

export default NewCollectionWatch;
