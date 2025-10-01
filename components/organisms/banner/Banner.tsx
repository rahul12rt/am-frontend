"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Banner = () => {
  const containerRef = useRef<HTMLElement>(null);

  const titleChars = "AM002 VALOR".split("");
  const textWords =
    "Mechanical watches may go through up to 50 or 60 different processes before the watch is considered to be as near to perfect as humanly possible before delivery.".split(
      " "
    );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let tl: gsap.core.Timeline | null = null;

    const initAnimation = () => {
      // Create timeline for smooth sequence
      tl = gsap.timeline();

      // Select and animate all title characters
      const titleSpans = container.querySelectorAll(".title-span");
      if (titleSpans.length > 0) {
        tl.to(titleSpans, {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.05,
          ease: "power4.out",
        });
      }

      // Select and animate all text words
      const textSpans = container.querySelectorAll(".text-span");
      if (textSpans.length > 0) {
        tl.to(
          textSpans,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.02,
            ease: "power3.out",
          },
          "-=0.5"
        );
      }
    };

    initAnimation();

    // Proper cleanup function
    return () => {
      if (tl) {
        tl.kill();
        tl = null;
      }
    };
  }, []); // Empty dependency array

  return (
    <section
      ref={containerRef}
      className="relative h-screen overflow-hidden bg-cover bg-center bg-no-repeat max-[768px]:bg-[center_100px] max-[768px]:bg-[length:150%] max-[768px]:bg-contain max-[768px]:h-[80vh]"
      style={{ backgroundImage: 'url("/images/hero_image.jpg")' }}
    >
      <div className="container h-full">
        <div className="h-full flex flex-col justify-end items-start py-16 max-[768px]:justify-center max-[768px]:pt-[380px]  max-[768px]:pb-[0px]\">
          {/* Title */}
          <h1 className="text-[5.6rem] max-[768px]:text-[4rem] font-[family-name:var(--font-ppeditorialnewitalic)]">
            {titleChars.map((char, i) => (
              <span key={i} className="inline-block">
                <span
                  className="title-span inline-block translate-y-full opacity-0 transition-all duration-1000 ease-out"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              </span>
            ))}
          </h1>

          {/* Text */}
          <p className="text-[1.6rem] text-white leading-snug max-w-[505px] mb-8">
            {textWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-[5px]">
                <span className="text-span inline-block translate-y-full opacity-0">
                  {word}
                </span>
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Banner;
