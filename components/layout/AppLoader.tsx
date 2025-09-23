"use client";

import React, { useState, useEffect } from 'react';
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

  // Check if user has visited before
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const visited = localStorage.getItem('alban-marcus-visited');
      setHasVisited(!!visited);
      
      if (showAlways || (!visited && showOnFirstVisit)) {
        setShouldShowLoader(true);
        if (!visited) {
          localStorage.setItem('alban-marcus-visited', 'true');
        }
      }
    }
  }, [showOnFirstVisit, showAlways]);

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
