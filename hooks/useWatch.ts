/**
 * @deprecated This file is deprecated. Use the new standardized hooks from @/hooks/queries/ instead.
 * 
 * Migration guide:
 * - useCreateWatch -> use useCreateWatch from @/hooks/queries/useWatches
 * - useUpdateWatch -> use useUpdateWatch from @/hooks/queries/useWatches  
 * - useGetWatchById -> use useWatch from @/hooks/queries/useWatches
 * 
 * The new hooks provide:
 * ✅ Better type safety with centralized types
 * ✅ Consistent query key management
 * ✅ Enhanced error handling
 * ✅ Optimistic updates
 * ✅ Better caching strategies
 * ✅ Unified API patterns
 */

// Export the new hooks for backward compatibility during migration
export { 
  useCreateWatch,
  useUpdateWatch,
  useWatch as useGetWatchById,
  useWatches,
  useFeaturedWatches,
  useSearchWatches,
  useWatchesByCategory,
  useWatchesBySeries,
  useDeleteWatch,
  usePrefetchWatch,
  useWatchFromCache,
  useOptimisticWatchUpdate,
  useInvalidateWatches,
  useInfiniteWatches
} from '@/hooks/queries/useWatches';

// Export types from the new API services for backward compatibility
export type {
  Watch,
  WatchImage,
  WatchFilters,
  WatchFormData,
  WatchImageFiles as WatchImages,
} from '@/lib/api-services';

// Legacy types for backward compatibility (marked as deprecated)
/**
 * @deprecated Use WatchFormData from @/lib/api-services instead
 */
export interface LegacyWatchFormData {
  name: string;
  description: string;
  characteristics: string;
  actualprice: number;
  offerprice: number;
  offerpercentage: number;
  category: string;
  series: string;
  modelgroup: string;
  releasedate: string;
  theme: string;
  warrantyperiod: string;
  stockavailability: string;
  isfeatured: boolean;
}

/**
 * @deprecated Use Partial<WatchFormData> from @/lib/api-services instead
 */
export interface UpdateWatchFormData extends Partial<LegacyWatchFormData> {}

/**
 * @deprecated Use CreateWatchPayload interface pattern from new hooks instead
 */
export interface CreateWatchPayload {
  formData: LegacyWatchFormData;
  images: {
    isoview?: File;
    front?: File;
    back?: File;
    side?: File;
    strap?: File;
    closeup?: File;
    dial?: File;
  };
}

/**
 * @deprecated Use UpdateWatchPayload interface pattern from new hooks instead
 */
export interface UpdateWatchPayload {
  id: string;
  formData: UpdateWatchFormData;
  images?: {
    isoview?: File;
    front?: File;
    back?: File;
    side?: File;
    strap?: File;
    closeup?: File;
    dial?: File;
  };
}

/**
 * @deprecated Use queryKeys from @/lib/query-keys instead
 */
export const watchQueryKeys = {
  all: ['watches'] as const,
  lists: () => ['watches', 'list'] as const,
  list: (filters: Record<string, any>) => ['watches', 'list', filters] as const,
  details: () => ['watches', 'detail'] as const,
  detail: (id: string) => ['watches', 'detail', id] as const,
} as const;