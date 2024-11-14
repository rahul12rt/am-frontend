"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Register the ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const containerRef = useRef<HTMLElement>(null);

  const titleWords = ["Upgrade", "Your Timepiece", "Collection Today"];
  const paragraphWords =
    `Each timepiece is subjected to the most rigorous quality controls. Our watchmakers control every spare part before it is assigned a place in inventory. Even if there is tiny marks, the piece will not be allowed through quality control, and it invariably means the loss of valuable parts and starting again from scratch. A great number of aesthetic criteria will be taken into consideration to ensure that the watch is beautifully finished.
    Mechanical watches may go through up to 50 or 60 different processes before the watch is considered to be as near to perfect as humanly possible before delivery.`.split(
      " "
    );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        end: "bottom top",
        toggleActions: "play",
        markers: false, // Set to true if you want to debug the animation points
      },
    });

    // Animate the title words with a staggered effect
    const titleSpans = container.querySelectorAll(".title-span");
    tl.to(titleSpans, {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.1,
      ease: "power4.out",
    });

    // Animate the paragraph words with a staggered effect, starting after the title animation
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
      "-=0.5" // This ensures the text starts animating after the title animation ends
    );

    return () => {
      tl.kill(); // Clean up the animation when the component unmounts
    };
  }, []);

  return (
    <section ref={containerRef} className="pt-[90px] pb-[70px]">
      <div className="container">
        <div className="flex justify-center gap-[141px] max-[1280px]:gap-[40px] max-[1024px]:flex-col">
          {/* Title animation */}
          <h2 className="max-w-[522px] flex-shrink-0 text-[4.8rem] leading-[58px] text-white-1">
            {titleWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-[5px]">
                <span
                  className={`title-span inline-block translate-y-full opacity-0 ${
                    word === "Your Timepiece"
                      ? "font-[family-name:var(--font-ppeditorialnewitalic)]"
                      : ""
                  }`}
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>

          {/* Paragraph animation */}
          <p className="text-[2rem] leading-[25px] max-[765px]:text-[16px]">
            {paragraphWords.map((word, i) => (
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

export default About;
