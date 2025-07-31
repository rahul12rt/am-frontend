'use client';
import Link from 'next/link';
import { MdKeyboardArrowRight } from 'react-icons/md';
import Collections from '@/components/organisms/collections/Collections';
import { fetchWatches, Watch } from '@/data/watches';
import { useEffect, useState } from 'react';

const Collection = () => {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatches()
      .then(setWatches)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className='pt-[90px] pb-[70px] bg-black-1 text-white-1'>
      <div className='container'>
        <p className='flex items-center text-[14px] pb-[40px] gap-2'>
          <Link href='/' className='opacity-60 hover:opacity-100'>
            Home
          </Link>
          <MdKeyboardArrowRight />
          <span>Collection</span>
        </p>
        {loading ? (
          <div className='text-center text-white-1'>Loading...</div>
        ) : (
          <Collections data={watches} />
        )}
      </div>
    </section>
  );
};

export default Collection;
