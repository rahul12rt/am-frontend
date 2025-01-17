"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Banner = () => {
  const containerRef = useRef<HTMLElement>(null);

  const titleChars = "AM0S1".split("");
  const textWords =
    "Mechanical watches may go through up to 50 or 60 different processes before the watch is considered to be as near to perfect as humanly possible before delivery.".split(
      " "
    );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create timeline for smooth sequence
    const tl = gsap.timeline();

    // Select and animate all title characters
    const titleSpans = container.querySelectorAll(".title-span");
    tl.to(titleSpans, {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.05,
      ease: "power4.out",
    });

    // Select and animate all text words
    const textSpans = container.querySelectorAll(".text-span");
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

    // Cleanup function needs to return void
    return () => {
      // Kill the timeline
      tl.kill();
      // Explicitly return void
      return undefined;
    };
  }, []); 

  return (
    <section
      ref={containerRef}
      className="relative h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/images/banner.png")' }}
    >
      <div className="container h-full">
        <div className="h-full flex flex-col justify-end items-start py-16">
          {/* Title */}
          <h1 className="text-[5.6rem] font-[family-name:var(--font-ppeditorialnewitalic)] leading-[1]">
            {titleChars.map((char, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <span className="title-span inline-block translate-y-full opacity-0">
                  {char}
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
