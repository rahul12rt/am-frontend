"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useAppLoader } from '@/hooks/useAppLoader';

interface AppLoaderProps {
  children: React.ReactNode;
  showOnFirstVisit?: boolean;
  showAlways?: boolean;
  minLoadingTime?: number;
}

const AppLoader: React.FC<AppLoaderProps> = ({ 
  children, 
  showOnFirstVisit = true,
  showAlways = false,
  minLoadingTime = 3000
}) => {
  const [hasVisited, setHasVisited] = useState(false);
  const [shouldShowLoader, setShouldShowLoader] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const pathname = usePathname();

  // Check if user has visited before and determine if we should show loader
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const visited = localStorage.getItem('alban-marcus-visited');
      const isFirstVisit = !visited;
      setHasVisited(!!visited);
      
      // Only show loader on first visit to the main page (/) 
      // Don't show on internal navigation (like cart to checkout)
      const isMainPage = pathname === '/';
      const shouldShow = (isFirstVisit && showOnFirstVisit && isMainPage && isInitialLoad);
      
      setShouldShowLoader(shouldShow);
      
      if (isFirstVisit && isMainPage) {
        localStorage.setItem('alban-marcus-visited', 'true');
      }
    }
  }, [showOnFirstVisit, showAlways, pathname, isInitialLoad]);

  // Track if this is the initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const { isLoading, progress, currentTask } = useAppLoader({
    minLoadingTime
  });

  const showLoading = shouldShowLoader && isLoading;

  const handleLoadingComplete = () => {
    setShouldShowLoader(false);
  };

  return (
    <>
      <LoadingScreen 
        isLoading={showLoading} 
        onComplete={handleLoadingComplete}
        progress={progress}
        currentTask={currentTask}
      />
      <div className={showLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}>
        {children}
      </div>
    </>
  );
};

export default AppLoader;
