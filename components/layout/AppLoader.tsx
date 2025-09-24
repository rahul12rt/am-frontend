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
  loadingEnabledPaths?: string[];
}

const AppLoader: React.FC<AppLoaderProps> = ({ 
  children, 
  showOnFirstVisit = true,
  showAlways = false,
  minLoadingTime = 3000,
  loadingEnabledPaths = ['/']
}) => {
  const [hasVisited, setHasVisited] = useState(false);
  const [shouldShowLoader, setShouldShowLoader] = useState(false);
  const pathname = usePathname();

  // Check if current path should show loader
  const isLoadingEnabledPath = loadingEnabledPaths.includes(pathname);

  // Check if user has visited before
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const visited = localStorage.getItem('alban-marcus-visited');
      setHasVisited(!!visited);
      
      // Only show loader if current path is enabled for loading
      if (isLoadingEnabledPath && (showAlways || (!visited && showOnFirstVisit))) {
        setShouldShowLoader(true);
        if (!visited) {
          localStorage.setItem('alban-marcus-visited', 'true');
        }
      }
    }
  }, [showOnFirstVisit, showAlways, isLoadingEnabledPath]);

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
