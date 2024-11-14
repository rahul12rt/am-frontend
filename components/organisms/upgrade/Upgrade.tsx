"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Register the ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const containerRef = useRef<HTMLElement>(null);

  const titleWords = ["Upgrade", "Your Timepiece", "Collection Today"];
  const paragraphItems = [
    "• Movement: Landeron 24 Skeleton AutomaticMovement - Swiss data to move Made merge data to be made single",
    "• Dimensions: 55 x 45 mm",
    "• Glass: Double Dome Sapphire Crystal with Anti-reflective coating",
    "• Number of jewels: 25",
    "• Movement: Landeron 24 Skeleton AutomaticMovement - Swiss data to move Made merge data to be made single",
    "• Dimensions: 55 x 45 mm",
    "• Glass: Double Dome Sapphire Crystal with Anti-reflective coating",
    "• Number of jewels: 25",
  ];

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

    // Animate the paragraph items (list items) with a staggered effect
    const listItems = container.querySelectorAll(".text-span");
    tl.to(
      listItems,
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      },
      "-=0.5" // This ensures the list starts animating after the title animation ends
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

          {/* List of paragraph items */}
          <ul className="text-[2rem] leading-[2.5rem] list-disc pl-[20px] max-[765px]:text-[16px]">
            {paragraphItems.map((item, i) => (
              <li
                key={i}
                className="pb-[10px] text-span inline-block translate-y-full opacity-0"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;
