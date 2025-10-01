"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

const WatchAnimation: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
    const [autoplayAttempted, setAutoplayAttempted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const maxRetries = 3;

  // Reset video function for retry mechanism
  const resetVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset all states
    setIsVideoLoaded(false);
    setIsPlaying(false);
    setVideoError(false);

    // Force reload the video element
    video.load();
  }, []);

  // Retry mechanism for failed video loads
  const retryVideoLoad = useCallback(() => {
    if (retryCount < maxRetries) {
      // Retry logging disabled for production
      setRetryCount(prev => prev + 1);
      resetVideo();
    } else {
      // Max retry error logging disabled for production
      setVideoError(true);
    }
  }, [retryCount, maxRetries, resetVideo]);

  useEffect(() => {
    // Detect Safari browser and iOS
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafariBrowser = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    setIsSafari(isSafariBrowser || isIOS);

    const video = videoRef.current;
    if (!video) return;

    // Clear any existing event listeners
    const cleanup = () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('suspend', handleSuspend);
    };

    // Enhanced event handlers
    const handleCanPlay = () => {
      // Video ready logging disabled for production
      setIsVideoLoaded(true);
      setVideoError(false);
      
      // Always attempt autoplay - Safari will block if needed
      if (!autoplayAttempted) {
        setAutoplayAttempted(true);
        attemptAutoplay();
      }
    };

    // Aggressive autoplay attempt for Safari compatibility
    const attemptAutoplay = async () => {
      if (!video) return;
      
      try {
        // Multiple autoplay strategies
        video.muted = true; // Ensure muted for autoplay
        video.volume = 0; // Double ensure silence
        
        // Strategy 1: Direct play
        await video.play();
        setIsPlaying(true);
        // Autoplay success logging disabled for production
      } catch (error) {
        // Strategy 2: Try with intersection observer (viewport visibility)
        if ('IntersectionObserver' in window) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(async (entry) => {
              if (entry.isIntersecting && !isPlaying) {
                try {
                  await video.play();
                  setIsPlaying(true);
                  observer.disconnect();
                } catch (e) {
                  // Intersection play failed logging disabled for production
                }
              }
            });
          }, { threshold: 0.5 });
          
          observer.observe(video);
          
          // Cleanup observer after 10 seconds
          setTimeout(() => observer.disconnect(), 10000);
        }
        
        // Strategy 3: Listen for any user interaction on the page
        const playOnInteraction = async () => {
          if (!userInteracted) {
            setUserInteracted(true);
            try {
              await video.play();
              setIsPlaying(true);
              // Remove listeners after successful play
              document.removeEventListener('touchstart', playOnInteraction);
              document.removeEventListener('click', playOnInteraction);
              document.removeEventListener('scroll', playOnInteraction);
            } catch (e) {
              // User interaction play failed logging disabled for production
            }
          }
        };
        
        // Add listeners for user interaction
        document.addEventListener('touchstart', playOnInteraction, { once: true, passive: true });
        document.addEventListener('click', playOnInteraction, { once: true });
        document.addEventListener('scroll', playOnInteraction, { once: true, passive: true });
      }
    };

    const handleLoadedData = () => {
      // Video data logging disabled for production
      setIsVideoLoaded(true);
      setVideoError(false);
    };

    const handleError = (e: Event) => {
      // Video error logging disabled for production
      setVideoError(true);
      
      // Auto-retry on error
      setTimeout(() => {
        retryVideoLoad();
      }, 1000);
    };

    const handleLoadStart = () => {
      // Video load start logging disabled for production
    };

    const handleProgress = () => {
      // Video is downloading
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const bufferedPercent = (bufferedEnd / duration) * 100;
          // Video buffer logging disabled for production
        }
      }
    };

    const handleStalled = () => {
      // Video stall logging disabled for production
      setTimeout(() => {
        retryVideoLoad();
      }, 2000);
    };

    const handleSuspend = () => {
      // Video suspend logging disabled for production
    };

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('suspend', handleSuspend);

    // Force initial load
    video.load();

    return cleanup;
  }, [retryCount, retryVideoLoad]);

  // Handle manual play (in case autoplay is blocked)
  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        // Play error logging disabled for production
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
        autoPlay // Enable autoplay attribute
        loop // Loop the video
        muted // Required for autoplay
        playsInline // Better mobile support - critical for Safari iOS
        preload="metadata" // Changed from none to metadata for better Safari support
        disablePictureInPicture
        controls={false} // Explicitly disable controls
        webkit-playsinline="true" // Legacy Safari support
        x-webkit-airplay="allow" // Allow AirPlay
        crossOrigin="anonymous" // Help with CORS issues
        onClick={handleVideoClick}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onWaiting={() => {/* Video waiting logging disabled for production */}}
        onCanPlayThrough={() => {/* Video ready logging disabled for production */}}
        // Add cache busting parameter to prevent iOS caching issues
        key={`video-${retryCount}`} // Force re-render on retry
      >
        <source 
          src={`/images/alban_final_video.mp4`} 
          type="video/mp4" 
        />
        {/* Fallback message */}
        Your browser does not support the video tag.
      </video>
      
      {/* Loading indicator */}
      {!isVideoLoaded && !videoError && (
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
            {retryCount > 0 ? `Retrying... (${retryCount}/${maxRetries})` : 'Loading video...'}
          </div>
        </div>
      )}

      {/* Error state with retry button */}
      {videoError && retryCount >= maxRetries && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
          <div className="text-white text-center px-4 mb-4">
            <p className="text-lg sm:text-xl font-medium mb-2">Video failed to load</p>
            <p className="text-sm opacity-80 mb-4">Please check your connection and try again</p>
            <button
              onClick={() => {
                setRetryCount(0);
                resetVideo();
              }}
              className="
                bg-white 
                bg-opacity-20 
                hover:bg-opacity-30 
                px-6 
                py-3 
                rounded-lg 
                transition-all
                duration-300
                backdrop-blur-sm
              "
            >
              Retry Video
            </button>
          </div>
        </div>
      )}

      {/* Play button overlay (only shows if autoplay completely failed) */}
      {isVideoLoaded && !isPlaying && autoplayAttempted && (
        <div 
          className="
            absolute 
            inset-0 
            flex 
            flex-col
            items-center 
            justify-center 
            bg-black 
            bg-opacity-40 
            cursor-pointer
            transition-all
            duration-300
            hover:bg-opacity-30
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
          
          <div className="text-white text-center px-4">
            <p className="text-lg sm:text-xl font-medium mb-2">Tap to Play</p>
            <p className="text-sm opacity-80">Experience our luxury watch collection</p>
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
