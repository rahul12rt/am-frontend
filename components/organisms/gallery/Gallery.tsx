'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageModal from '@/components/molecules/imageModal/ImageModal';

const images = [
  'galleryOne.webp',
  'galleryTwo.webp',
  'galleryThree.webp',
  'galleryFour.webp',
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        <ImageModal
          selectedImage={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </section>
  );
};

export default Gallery;
