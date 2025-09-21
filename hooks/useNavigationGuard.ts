'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook to prevent rapid navigation and cleanup issues
 */
export const useNavigationGuard = () => {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    // Only set navigating if pathname actually changed
    if (previousPathnameRef.current !== pathname) {
      setIsNavigating(true);
      previousPathnameRef.current = pathname;
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Reset navigation flag after DOM operations complete
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 200);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsNavigating(false);
    };
  }, []);

  return {
    isNavigating,
    pathname
  };
};
