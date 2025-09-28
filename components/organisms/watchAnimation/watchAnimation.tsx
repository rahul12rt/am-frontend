"use client";
import React, { useEffect, useRef, useState } from "react";

const WatchAnimation: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Detect Safari browser
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafariBrowser = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    setIsSafari(isSafariBrowser);

    const video = videoRef.current;
    if (!video) return;

    // Enhanced Safari compatibility
    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      
      // For Safari, we need to be more careful with autoplay
      if (isSafariBrowser) {
        // Safari mobile often blocks autoplay, so we'll just show the play button
        console.log('Safari detected - autoplay may be restricted');
        return;
      }
      
      // Small delay to ensure smooth playback for other browsers
      setTimeout(() => {
        video.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Autoplay prevented:', error);
          // Autoplay was prevented, user will need to interact
        });
      }, 100);
    };

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      // Force Safari to prepare for playback
      if (isSafariBrowser) {
        video.load(); // Reload video for Safari compatibility
      }
    };

    const handleError = (e: Event) => {
      console.error('Video loading error:', e);
      setIsVideoLoaded(true); // Still show the interface even if video fails
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
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
      h-[50vh]
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
        playsInline // Better mobile support - critical for Safari iOS
        preload={isSafari ? "metadata" : "auto"} // Safari works better with metadata
        disablePictureInPicture
        controls={false} // Explicitly disable controls
        webkit-playsinline="true" // Legacy Safari support
        x-webkit-airplay="allow" // Allow AirPlay
        onClick={handleVideoClick}
        onError={(e) => console.error('Video loading error:', e)}
        onLoadStart={() => console.log('Video load started')}
        onCanPlay={() => console.log('Video can play')}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src="/images/alban_final_video.mp4" type="video/mp4" />
        {/* Add WebM fallback for better browser support */}
        <source src="/images/alban_final_video.webm" type="video/webm" />
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

      {/* Play button overlay (shows if autoplay is blocked or Safari) */}
      {isVideoLoaded && (!isPlaying || isSafari) && (
        <div 
          className="
            absolute 
            inset-0 
            flex 
            flex-col
            items-center 
            justify-center 
            bg-black 
            bg-opacity-60 
            cursor-pointer
            transition-all
            duration-300
            hover:bg-opacity-50
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
            mb-4
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
          
          {/* Safari-specific message */}
          {isSafari && (
            <div className="text-white text-center px-4">
              <p className="text-lg sm:text-xl font-medium mb-2">Tap to Play Video</p>
              <p className="text-sm opacity-80">Safari requires user interaction to start videos</p>
            </div>
          )}
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
