'use client';

import { useState } from 'react';
import Image from 'next/image';

const images = [
  'galleryOne.webp',
  'galleryTwo.webp',
  'galleryThree.webp',
  'galleryFour.webp',
];

const Gallery = () => {
  const [selectedImage, setSelectedImage]: any = useState(null);

  const handleModalClick = (e: any) => {
    if (e.target === e.currentTarget) {
      setSelectedImage(null);
    }
  };

  return (
    <section className='pb-[80px]'>
      <div className='container'>
        <div className='grid grid-cols-3 grid-rows-2 gap-5 h-[753px]'>
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative rounded-lg cursor-pointer [&:nth-child(3)]:col-span-2 [&:nth-child(3)]:col-start-1 [&:nth-child(3)]:row-start-2 last-of-type:row-span-2 last-of-type:col-start-3 last-of-type:row-start-1] ${image}`}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                className='object-cover rounded-lg object-center'
                src={`/images/${image}`}
                alt='gallery'
                fill
              />
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className='fixed inset-0 bg-black/80 flex items-center justify-center z-50'
          style={{ backdropFilter: 'blur(20px)' }}
          onClick={handleModalClick}
        >
          <div className='relative w-[768px] h-[75vh]'>
            <button
              onClick={() => setSelectedImage(null)}
              className='absolute top-[-10px] right-[-10px] text-white rounded-full flex items-center justify-center z-[1] w-[22px] h-[22px] text-[1.6rem] border-[1px]'
            >
              x
            </button>
            <Image
              src={`/images/${selectedImage}`}
              alt='gallery'
              fill
              className='object-cover'
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
