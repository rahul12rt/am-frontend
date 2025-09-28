"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Register the ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const containerRef = useRef<HTMLElement>(null);

  const titleWords = ["Crafting Time,", "Defining Elegance", "– Alban Marcus"];
  const paragraphSections = [
    "At Alban Marcus, we believe time is more than just minutes and hours — it's an experience. Each watch we create is a blend of timeless craftsmanship, modern design, and refined luxury, built for those who value precision and elegance in every moment. Our upcoming collection of luxury watches reflects sophistication, exclusivity, and artistry.",
    "Designed to complement your lifestyle, Alban Marcus timepieces are more than accessories — they are statements of individuality and legacy. Be the first to experience the new era of premium watches.",
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
    <section ref={containerRef} className="pt-[90px] max-[768px]:pt-[30px] pb-[70px]">
      <div className="container">
        <div className="flex justify-center gap-[141px] max-[1280px]:gap-[40px] max-[1024px]:flex-col">
          {/* Title animation */}
          <h2 className="max-w-[522px] flex-shrink-0 text-[4.8rem] leading-[58px] text-white-1 max-[768px]:text-[3.6rem] max-[765px]:leading-[46px]">
            {titleWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-[5px]">
                <span
                  className={`title-span inline-block translate-y-full opacity-0 ${word === "Defining Elegance"
                      ? "font-[family-name:var(--font-ppeditorialnewitalic)]"
                      : ""
                    }`}
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>

          {/* Paragraphs */}
          <div className="space-y-6 text-[2rem] leading-[25px] max-[765px]:text-[16px]">
            {paragraphSections.map((section, idx) => (
              <p key={idx}>
                {section.split(" ").map((word, i) => (
                  <span
                    key={i}
                    className="inline-block overflow-hidden mr-[5px]"
                  >
                    <span className="text-span inline-block translate-y-full opacity-0">
                      {word}
                    </span>
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
