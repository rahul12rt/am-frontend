'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Extend Window interface for GSAP types
declare global {
  interface Window {
    gsap?: any;
    ScrollTrigger?: any;
  }
}

/**
 * Hook to cleanup GSAP animations when navigating away from a page
 */
export const useGSAPCleanup = () => {
  const pathname = usePathname();

  useEffect(() => {
    return () => {
      // Cleanup GSAP animations on route change
      if (typeof window !== 'undefined') {
        // Kill all GSAP tweens and timelines
        if (window.gsap) {
          window.gsap.killTweensOf("*");
          if (window.gsap.globalTimeline) {
            window.gsap.globalTimeline.clear();
          }
        }
        
        // Kill all ScrollTriggers
        if (window.ScrollTrigger) {
          window.ScrollTrigger.killAll();
          window.ScrollTrigger.refresh();
        }
      }
    };
  }, [pathname]);

  // Also cleanup on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        if (window.gsap) {
          window.gsap.killTweensOf("*");
        }
        if (window.ScrollTrigger) {
          window.ScrollTrigger.killAll();
        }
      }
    };
  }, []);
};
