"use client";

import Image from "next/image";

const images = [
  "imageSectiion_2_final.jpg",
  "imageSection_3_final.jpg",
  "imageSection_1_final.jpg",
  "galleryFour.jpg",
];

const Gallery = () => {

  return (
    <section className="pb-[80px]">
      <div className="container">
        <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 md:grid-cols-3 md:grid-rows-2 md:h-[753px] md:gap-5">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative rounded-[1rem] cursor-pointer h-[150px] sm:h-[180px] md:h-auto
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
            >
              <Image
                className="object-cover rounded-[1rem] object-center border border-gray-300"
                src={`/images/${image}`}
                alt="gallery"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
