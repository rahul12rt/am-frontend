"use client";

import { useState } from "react";
import Image from "next/image";
import ImageModal from "@/components/molecules/imageModal/ImageModal";

const images = [
  "galleryOne.webp",
  "galleryTwo.webp",
  "galleryThree.webp",
  "galleryFour.webp",
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section className="pb-[80px]">
      <div className="container">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:grid-rows-2 md:h-[753px]">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative rounded-lg cursor-pointer h-[300px] md:h-auto
                ${
                  index === 2
                    ? "md:[&]:col-span-2 md:[&]:col-start-1 md:[&]:row-start-2"
                    : ""
                }
                ${
                  index === 3
                    ? "md:[&]:row-span-2 md:[&]:col-start-3 md:[&]:row-start-1"
                    : ""
                }
              `}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                className="object-cover rounded-lg object-center "
                src={`/images/${image}`}
                alt="gallery"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
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
