"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ImageSequence: React.FC = () => {
  const totalImages: number = 120;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentImage, setCurrentImage] = useState<string>(
    "/images/sequence/watch1.png"
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current) return;
      gsap.to(
        {},
        {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: `+=${totalImages * 100}vh`,
            scrub: true,
            pin: true,
            onUpdate: (self) => {
              const frameIndex = Math.min(
                totalImages - 1,
                Math.floor(self.progress * totalImages)
              );
              setCurrentImage(`/images/sequence/watch${frameIndex + 1}.png`);
            },
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [totalImages]);

  return (
    <div ref={containerRef}>
      <div>
        <img
          src={currentImage}
          alt="Watch Sequence"
          className="sequenceWrapper"
        />
      </div>
    </div>
  );
};

export default ImageSequence;
