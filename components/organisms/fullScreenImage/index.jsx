import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./index.module.css";

gsap.registerPlugin(ScrollTrigger);

const FullScreenImage = () => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;

    // GSAP Animation
    gsap.fromTo(
      image,
      { scale: 0.5 }, 
      {
        scale: 1.06,
        scrollTrigger: {
          trigger: container,
          start: "-50px top",
          end: "center top", 
          scrub: true, 
          pin: true, 
          pinSpacing: false,
        },
      }
      
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.imageWrapper}>
        <img
          ref={imageRef}
          src="/images/fillScreenImg.jpg"
          alt="Fullscreen Animation"
          className={styles.image}
        />
      </div>
    </div>
  );
};

export default FullScreenImage;
