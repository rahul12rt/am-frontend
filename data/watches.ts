/**
 * @deprecated Use types from @/lib/api-services instead
 * This file is kept for backward compatibility but should not be used for new code.
 * Use the new standardized TanStack Query hooks from @/hooks/queries/useWatches
 */

export interface WatchImage {
  id: string;
  isoview: string;
  front: string;
  back: string;
  side: string;
  strap: string;
  closeup: string;
  dial: string;
}

export interface Watch {
  id: string;
  name: string;
  description: string;
  characteristics: string;
  actualprice: string;
  offerprice: string;
  offerpercentage: string;
  rating: number;
  reviewscount: number;
  category: string;
  series: string;
  modelgroup: string;
  releasedate: string;
  theme: string;
  warrantyperiod: string;
  stockavailability: boolean;
  isfeatured: boolean;
  createdat: string;
  updatedat: string;
  WatchImages: WatchImage[];
}

/**
 * @deprecated Use useWatches hook from @/hooks/queries/useWatches instead
 * Direct fetch calls have been replaced with TanStack Query hooks for better:
 * - Caching and performance
 * - Error handling
 * - Loading states
 * - Type safety
 * 
 * Example migration:
 * OLD: const watches = await fetchWatches();
 * NEW: const { data: watches, isLoading, error } = useWatches();
 */
export async function fetchWatches(): Promise<Watch[]> {
  throw new Error(
    'fetchWatches is deprecated. Use useWatches hook from @/hooks/queries/useWatches instead.'
  );
}