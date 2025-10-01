'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Watch } from '@/lib/api-services';
import { useWatches } from '@/hooks/queries/useWatches';
import { usePathname } from 'next/navigation';

interface WatchCacheContextType {
  // Core cache data
  allWatches: Watch[];
  isLoading: boolean;
  error: Error | null;
  
  // Cache utilities
  getWatchById: (id: string) => Watch | undefined;
  getWatchesByCategory: (category: string) => Watch[];
  getWatchesBySeries: (series: string) => Watch[];
  getFeaturedWatches: () => Watch[];
  getRandomWatches: (count: number, excludeId?: string) => Watch[];
  
  // Image preloading
  preloadWatchImages: (watchId: string) => void;
  preloadedImages: Set<string>;
  
  // Cache management
  refreshCache: () => void;
  isCacheReady: boolean;
}

const WatchCacheContext = createContext<WatchCacheContextType | undefined>(undefined);

export function WatchCacheProvider({ children }: { children: React.ReactNode }) {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [isCacheReady, setIsCacheReady] = useState(false);
  const pathname = usePathname();
  
  // Define paths that need watch data
  const watchDataPaths = ['/', '/collections', '/watches', '/most-loved', '/new-collection'];
  const needsWatchData = watchDataPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/') || pathname.startsWith('/watches/')
  );
  
  // Fetch all watches data only when needed
  const { data: allWatches = [], isLoading, error, refetch } = useWatches(undefined, {
    enabled: needsWatchData
  });

  // Set cache ready when data is loaded
  useEffect(() => {
    if (!isLoading && allWatches.length > 0) {
      setIsCacheReady(true);
      console.log(`🚀 Watch cache initialized with ${allWatches.length} watches`);
    }
  }, [isLoading, allWatches.length]);

  // Utility functions
  const getWatchById = useCallback((id: string): Watch | undefined => {
    return allWatches.find(watch => watch.id === id);
  }, [allWatches]);

  const getWatchesByCategory = useCallback((category: string): Watch[] => {
    return allWatches.filter(watch => 
      watch.category?.toLowerCase() === category.toLowerCase()
    );
  }, [allWatches]);

  const getWatchesBySeries = useCallback((series: string): Watch[] => {
    return allWatches.filter(watch => 
      watch.series?.toLowerCase() === series.toLowerCase()
    );
  }, [allWatches]);

  const getFeaturedWatches = useCallback((): Watch[] => {
    return allWatches.filter(watch => watch.isfeatured);
  }, [allWatches]);

  // Get random watches with consistent seeding for recommendations
  const getRandomWatches = useCallback((count: number, excludeId?: string): Watch[] => {
    const availableWatches = excludeId 
      ? allWatches.filter(watch => watch.id !== excludeId)
      : allWatches;
    
    if (availableWatches.length === 0) return [];
    
    // Create a seeded random function for consistent results
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    // Use current date as seed for daily rotation of recommendations
    const today = new Date();
    const seed = today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate();
    
    // Create a shuffled copy with consistent ordering for the day
    const shuffled = [...availableWatches].sort((a, b) => {
      const seedA = seed + (a.id ? parseInt(a.id.replace(/\D/g, '')) || 0 : 0);
      const seedB = seed + (b.id ? parseInt(b.id.replace(/\D/g, '')) || 0 : 0);
      return seededRandom(seedA) - seededRandom(seedB);
    });
    
    return shuffled.slice(0, count);
  }, [allWatches]);

  // Image preloading function - DISABLED for mobile performance
  const preloadWatchImages = useCallback((watchId: string) => {
    // Preloading disabled to improve mobile performance and image quality
    // Next.js Image optimization handles caching efficiently
    console.log(`🚫 Image preloading disabled for watch: ${watchId}`);
    return;
  }, []);

  const refreshCache = useCallback(() => {
    refetch();
  }, [refetch]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    allWatches,
    isLoading,
    error,
    getWatchById,
    getWatchesByCategory,
    getWatchesBySeries,
    getFeaturedWatches,
    getRandomWatches,
    preloadWatchImages,
    preloadedImages,
    refreshCache,
    isCacheReady,
  }), [
    allWatches,
    isLoading,
    error,
    getWatchById,
    getWatchesByCategory,
    getWatchesBySeries,
    getFeaturedWatches,
    getRandomWatches,
    preloadWatchImages,
    preloadedImages,
    refreshCache,
    isCacheReady,
  ]);

  return (
    <WatchCacheContext.Provider value={contextValue}>
      {children}
    </WatchCacheContext.Provider>
  );
}

// Custom hook to use the watch cache
export function useWatchCache() {
  const context = useContext(WatchCacheContext);
  if (context === undefined) {
    throw new Error('useWatchCache must be used within a WatchCacheProvider');
  }
  return context;
}

// Hook for getting a specific watch from cache
export function useWatchFromCache(id: string) {
  const { getWatchById, isCacheReady } = useWatchCache();
  
  return useMemo(() => ({
    watch: getWatchById(id),
    isReady: isCacheReady,
  }), [getWatchById, id, isCacheReady]);
}

// Hook for getting random recommendations
export function useRandomRecommendations(count: number = 4, excludeId?: string) {
  const { getRandomWatches, isCacheReady } = useWatchCache();
  
  return useMemo(() => ({
    recommendations: getRandomWatches(count, excludeId),
    isReady: isCacheReady,
  }), [getRandomWatches, count, excludeId, isCacheReady]);
}

// Hook for preloading watch images
export function useWatchImagePreloader() {
  const { preloadWatchImages } = useWatchCache();
  
  return useCallback((watchId: string) => {
    preloadWatchImages(watchId);
  }, [preloadWatchImages]);
}
