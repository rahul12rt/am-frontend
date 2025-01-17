"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WatchDisplay from "../../components/atoms/WatchDisplay";
import VideoDisplay from "../../components/atoms/Video";
import Info from "../../components/organisms/info";
import FullScreenImage from "../../components/organisms/fullScreenImage";
import Upgrade from "../../components/organisms/upgrade/Upgrade";
import QaulityMarque from "@/components/organisms/qualityMarque/QualityMarque";
import Gallery from "@/components/organisms/gallery/Gallery";
import GetInTouch from "@/components/organisms/getInTouch/GetInTouch";

function ProductPage() {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  const titleChars = "AM0S1".split("");
  const textWords =
    "Mechanical watches may go through up to 50 or 60 different processes before the watch is considered to be as near to perfect as humanly possible before delivery.".split(
      " "
    );

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    if (!container) return;

    // Text animation timeline
    const tl = gsap.timeline();

    const titleSpans = container.querySelectorAll(".title-span");
    tl.to(titleSpans, {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.05,
      ease: "power4.out",
    });

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

    // Background color change animation
    gsap.to(wrapperRef.current, {
      backgroundColor: "white",
      scrollTrigger: {
        trigger: ".video-section",
        start: "500px center",
        end: "bottom center",
        toggleActions: "play none none reverse",
        markers: true,
      },
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      <div ref={wrapperRef} className="transition-colors duration-300">
        <section
          ref={containerRef}
          className="relative h-screen overflow-hidden bg-cover bg-end bg-no-repeat"
          style={{ backgroundImage: 'url("/images/productImage.png")' }}
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
            </div>
          </div>
        </section>
        <WatchDisplay />
        <div className="video-section">
          <VideoDisplay />
          <Info />
          <FullScreenImage />
        </div>
      </div>
      <div className="container bg-custom" id="flex">
        <img src="/images/watch-silver.png" alt="watch-silver" />
        <div className="content">
          <h6 className="customFont">AM 0S1</h6>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industrys standard dummy text
            ever since the 1500s, when an unknown printerLorem Ipsum is simply
            dummy text of the printing and typesetting industry. Lorem Ipsum has
            been the industrys.
          </p>
        </div>
        <img
          src="/images/watch-silver.png"
          alt="watch-silver"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>
      {/* <Upgrade /> */}
      <QaulityMarque />
      <Gallery />
      <GetInTouch />
    </>
  );
}

export default ProductPage;
