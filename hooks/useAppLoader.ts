"use client";

import { useState, useEffect } from 'react';

interface UseAppLoaderProps {
  minLoadingTime?: number; // Minimum time to show loading screen
}

interface LoadingState {
  isLoading: boolean;
  progress: number;
  currentTask: string;
}

export const useAppLoader = ({ 
  minLoadingTime = 3000
}: UseAppLoaderProps = {}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    progress: 0,
    currentTask: 'Loading finest luxury'
  });

  useEffect(() => {
    const loadApp = async () => {
      const startTime = Date.now();
      
      try {
        // Simulate loading progress
        setLoadingState(prev => ({ 
          ...prev, 
          currentTask: 'Loading finest luxury', 
          progress: 20 
        }));

        await new Promise(resolve => setTimeout(resolve, 800));

        setLoadingState(prev => ({ 
          ...prev, 
          currentTask: 'Crafting excellence', 
          progress: 40 
        }));

        await new Promise(resolve => setTimeout(resolve, 800));

        setLoadingState(prev => ({ 
          ...prev, 
          currentTask: 'Preparing your experience', 
          progress: 60 
        }));

        await new Promise(resolve => setTimeout(resolve, 800));

        setLoadingState(prev => ({ 
          ...prev, 
          currentTask: 'Curating timepieces', 
          progress: 80 
        }));

        await new Promise(resolve => setTimeout(resolve, 600));

        setLoadingState(prev => ({ 
          ...prev, 
          currentTask: 'Almost ready', 
          progress: 95 
        }));

        // Ensure minimum loading time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        // Complete loading
        setLoadingState(prev => ({ 
          ...prev, 
          progress: 100 
        }));

        // Small delay before hiding
        setTimeout(() => {
          setLoadingState(prev => ({ 
            ...prev, 
            isLoading: false 
          }));
        }, 300);

      } catch (error) {
        console.error('Loading failed:', error);
        // Still complete loading
        setLoadingState({
          isLoading: false,
          progress: 100,
          currentTask: 'Ready'
        });
      }
    };

    loadApp();
  }, [minLoadingTime]); // Only depend on minLoadingTime

  return loadingState;
};

// Asset lists removed - no longer needed since we're not preloading assets
