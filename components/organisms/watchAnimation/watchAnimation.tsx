"use client";
import React, { useEffect, useRef, useState } from "react";

const WatchAnimation: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Auto-play when video is loaded and ready
    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      // Small delay to ensure smooth playback
      setTimeout(() => {
        video.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Autoplay prevented:', error);
          // Autoplay was prevented, user will need to interact
        });
      }, 100);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', () => setIsVideoLoaded(true));

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', () => setIsVideoLoaded(true));
    };
  }, []);

  // Handle manual play (in case autoplay is blocked)
  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Play failed:', error);
      });
    }
  };

  return (
    <section className="
      relative 
      w-full 
      h-screen 
      sm:h-[60vh] 
      md:h-[70vh] 
      lg:h-[80vh] 
      xl:h-screen
      overflow-hidden 
      bg-black
    ">
      <video
        ref={videoRef}
        className="
          w-full 
          h-full 
          object-cover 
          cursor-pointer
          transition-all
          duration-300
        "
        loop // Loop the video
        muted // Required for autoplay
        playsInline // Better mobile support
        preload="auto" // Load the video for smooth playback
        disablePictureInPicture
        onClick={handleVideoClick}
        onError={(e) => console.error('Video loading error:', e)}
      >
        <source src="/images/alban_final_video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Loading indicator */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="
            text-white 
            text-lg 
            sm:text-xl 
            md:text-2xl
            animate-pulse
            px-4
            text-center
          ">
            Loading video...
          </div>
        </div>
      )}

      {/* Play button overlay (shows if autoplay is blocked) */}
      {isVideoLoaded && !isPlaying && (
        <div 
          className="
            absolute 
            inset-0 
            flex 
            items-center 
            justify-center 
            bg-black 
            bg-opacity-50 
            cursor-pointer
            transition-all
            duration-300
            hover:bg-opacity-40
          "
          onClick={handleVideoClick}
        >
          <div className="
            bg-white 
            bg-opacity-20 
            rounded-full 
            p-4 
            sm:p-6 
            md:p-8
            hover:bg-opacity-30 
            transition-all
            duration-300
            hover:scale-110
            backdrop-blur-sm
          ">
            <svg 
              className="
                w-12 
                h-12 
                sm:w-16 
                sm:h-16 
                md:w-20 
                md:h-20
                text-white
                drop-shadow-lg
              " 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Responsive video controls hint for mobile */}
      <div className="
        absolute 
        bottom-4 
        left-4 
        right-4
        sm:hidden
        text-white 
        text-sm 
        text-center 
        opacity-70
        pointer-events-none
      ">
        Tap to play/pause
      </div>
    </section>
  );
};

export default WatchAnimation;
