'use client';

import { useEffect, useState } from 'react';
import { useWatchCache } from '@/contexts/WatchCacheContext';

interface CacheStats {
  totalWatches: number;
  preloadedImages: number;
  cacheHitRate: number;
  loadTime: number;
}

const CacheMonitor = () => {
  const { allWatches, preloadedImages, isCacheReady, isLoading } = useWatchCache();
  const [stats, setStats] = useState<CacheStats>({
    totalWatches: 0,
    preloadedImages: 0,
    cacheHitRate: 0,
    loadTime: 0
  });
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (isCacheReady) {
      const loadTime = Date.now() - startTime;
      setStats({
        totalWatches: allWatches.length,
        preloadedImages: 0, // Preloading disabled
        cacheHitRate: 0, // Using Next.js Image optimization instead
        loadTime
      });
    }
  }, [isCacheReady, allWatches.length, startTime]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">🚀 Cache Monitor</div>
      <div className="space-y-1">
        <div>Status: {isCacheReady ? '✅ Ready' : isLoading ? '⏳ Loading' : '❌ Error'}</div>
        <div>Watches: {stats.totalWatches}</div>
        <div>Image Preloading: ❌ Disabled</div>
        <div>Optimization: Next.js Images</div>
        <div>Load Time: {stats.loadTime}ms</div>
      </div>
    </div>
  );
};

export default CacheMonitor;
