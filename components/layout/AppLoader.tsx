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
  const pathname = usePathname();
  
  // Check if current path should show loader
  const isLoadingEnabledPath = loadingEnabledPaths.includes(pathname);
  
  // Initialize with false to match server-side rendering
  const [shouldShowLoader, setShouldShowLoader] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Client-side initialization to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    
    // Mark that JavaScript has loaded
    document.body.classList.add('js-loaded');
    
    const visited = localStorage.getItem('alban-marcus-visited');
    
    // Determine if loader should show based on client-side conditions
    const shouldShow = isLoadingEnabledPath && (showAlways || (!visited && showOnFirstVisit));
    setShouldShowLoader(shouldShow);
    
    // Set localStorage if this is first visit and loader should show
    if (shouldShow && !visited && showOnFirstVisit) {
      localStorage.setItem('alban-marcus-visited', 'true');
    }
    
    setHasInitialized(true);
  }, [isLoadingEnabledPath, showAlways, showOnFirstVisit]);

  const { isLoading, progress, currentTask } = useAppLoader({
    minLoadingTime
  });

  const showLoading = shouldShowLoader && isLoading;

  const handleLoadingComplete = () => {
    setShouldShowLoader(false);
  };

  return (
    <>
      {/* Only render loading screen after client hydration */}
      {isClient && showLoading && (
        <div className="loading-screen">
          <LoadingScreen 
            isLoading={showLoading} 
            onComplete={handleLoadingComplete}
            progress={progress}
            currentTask={currentTask}
          />
        </div>
      )}
      
      {/* Always render content wrapper for consistent SSR/CSR */}
      <div 
        className={`app-content-wrapper ${
          isClient && !showLoading && hasInitialized ? 'loaded' : ''
        }`}
      >
        {children}
      </div>
    </>
  );
};

export default AppLoader;
