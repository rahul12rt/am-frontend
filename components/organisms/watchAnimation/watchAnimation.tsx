"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

const WatchAnimation: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
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
      console.log(`Retrying video load (attempt ${retryCount + 1}/${maxRetries})`);
      setRetryCount(prev => prev + 1);
      resetVideo();
    } else {
      console.error('Max retries reached for video loading');
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
      console.log('Video can play');
      setIsVideoLoaded(true);
      setVideoError(false);
      
      // For Safari/iOS, we need to be more careful with autoplay
      if (isSafariBrowser || isIOS) {
        console.log('Safari/iOS detected - autoplay may be restricted');
        return;
      }
      
      // Small delay to ensure smooth playback for other browsers
      setTimeout(() => {
        video.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Autoplay prevented:', error);
        });
      }, 100);
    };

    const handleLoadedData = () => {
      console.log('Video data loaded');
      setIsVideoLoaded(true);
      setVideoError(false);
    };

    const handleError = (e: Event) => {
      console.error('Video loading error:', e);
      setVideoError(true);
      
      // Auto-retry on error
      setTimeout(() => {
        retryVideoLoad();
      }, 1000);
    };

    const handleLoadStart = () => {
      console.log('Video load started');
    };

    const handleProgress = () => {
      // Video is downloading
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const bufferedPercent = (bufferedEnd / duration) * 100;
          console.log(`Video buffered: ${bufferedPercent.toFixed(1)}%`);
        }
      }
    };

    const handleStalled = () => {
      console.log('Video loading stalled - attempting retry');
      setTimeout(() => {
        retryVideoLoad();
      }, 2000);
    };

    const handleSuspend = () => {
      console.log('Video loading suspended');
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
        preload="none" // Don't preload to avoid caching issues
        disablePictureInPicture
        controls={false} // Explicitly disable controls
        webkit-playsinline="true" // Legacy Safari support
        x-webkit-airplay="allow" // Allow AirPlay
        crossOrigin="anonymous" // Help with CORS issues
        onClick={handleVideoClick}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onWaiting={() => console.log('Video waiting for data')}
        onCanPlayThrough={() => console.log('Video can play through')}
        // Add cache busting parameter to prevent iOS caching issues
        key={`video-${retryCount}`} // Force re-render on retry
      >
        <source 
          src={`/images/alban_final_video.mp4?v=${Date.now()}`} 
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
