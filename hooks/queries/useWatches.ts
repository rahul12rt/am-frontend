/**
 * Comprehensive Watch Query Hooks
 * 
 * This file provides all TanStack Query hooks for watch-related operations
 * using the standardized query key factory and API services.
 */

'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { 
  watchServices, 
  type Watch, 
  type WatchFilters, 
  type WatchFormData, 
  type WatchImageFiles
} from '@/lib/api-services';
import { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api-clients';

// =================
// QUERY HOOKS (READ OPERATIONS)
// =================

/**
 * Get all watches with optional filters
 */
export const useWatches = (filters?: WatchFilters, options?: { enabled?: boolean }) => {
  return useQuery<Watch[], AxiosError>({
    queryKey: queryKeys.watches.list(filters),
    queryFn: () => watchServices.getWatches(filters),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount: number, error: AxiosError) => {
      // Don't retry on client errors (4xx)
      if (error instanceof AxiosError && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: false,
  });
};

/**
 * Get a single watch by ID
 */
export const useWatch = (id: string, enabled: boolean = true) => {
  return useQuery<Watch, AxiosError>({
    queryKey: queryKeys.watches.detail(id),
    queryFn: () => watchServices.getWatchById(id),
    enabled: !!id && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes (longer stale time for individual items)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount: number, error: AxiosError) => {
      // Don't retry on 404 errors
      if (error instanceof AxiosError && error.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Get featured watches
 */
export const useFeaturedWatches = (limit?: number) => {
  return useQuery<Watch[], AxiosError>({
    queryKey: queryKeys.watches.featured(),
    queryFn: () => watchServices.getFeaturedWatches(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes (featured content changes less frequently)
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
};

/**
 * Search watches with debouncing
 */
export const useSearchWatches = (query: string, filters?: Omit<WatchFilters, 'search'>, enabled: boolean = true) => {
  return useQuery<Watch[], AxiosError>({
    queryKey: queryKeys.watches.search(query),
    queryFn: () => watchServices.searchWatches(query, filters),
    enabled: !!query.trim() && query.length >= 2 && enabled, // Only search if query is meaningful
    staleTime: 2 * 60 * 1000, // 2 minutes (search results become stale quickly)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Get watches by category
 */
export const useWatchesByCategory = (category: string, enabled: boolean = true) => {
  return useQuery<Watch[], AxiosError>({
    queryKey: queryKeys.watches.byCategory(category),
    queryFn: () => watchServices.getWatches({ category }),
    enabled: !!category && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

/**
 * Get watches by series
 */
export const useWatchesBySeries = (series: string, enabled: boolean = true) => {
  return useQuery<Watch[], AxiosError>({
    queryKey: queryKeys.watches.bySeries(series),
    queryFn: () => watchServices.getWatches({ series }),
    enabled: !!series && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

/**
 * Infinite query for paginated watches (useful for infinite scroll)
 */
export const useInfiniteWatches = (filters?: Omit<WatchFilters, 'page'>) => {
  return useInfiniteQuery<Watch[], AxiosError, number>({
    queryKey: queryKeys.watches.list({ ...filters, infinite: true }),
    queryFn: ({ pageParam }) => 
      watchServices.getWatches({ ...filters, page: pageParam as number }),
    getNextPageParam: (lastPage: Watch[], allPages: Watch[][]) => {
      // Assuming your API returns empty array when no more data
      if (lastPage.length === 0) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// =================
// MUTATION HOOKS (WRITE OPERATIONS)
// =================

/**
 * Create a new watch
 */
export const useCreateWatch = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Watch, 
    AxiosError, 
    { formData: WatchFormData; images: WatchImageFiles }
  >({
    mutationFn: ({ formData, images }) =>
      watchServices.createWatch(formData, images),
    
    onSuccess: (newWatch: Watch) => {
      // Invalidate and refetch all watch lists
      queryClient.invalidateQueries({ queryKey: queryKeys.watches.lists() });
      
      // Add the new watch to the detail cache
      queryClient.setQueryData(queryKeys.watches.detail(newWatch.id), newWatch);
      
      // If the watch is featured, invalidate featured watches
      if (newWatch.isfeatured) {
        queryClient.invalidateQueries({ queryKey: queryKeys.watches.featured() });
      }
      
      // Invalidate category-specific queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.watches.byCategory(newWatch.category) 
      });
      
      // Invalidate series-specific queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.watches.bySeries(newWatch.series) 
      });

      console.log('Watch created successfully:', newWatch);
    },
    
    onError: (error: AxiosError) => {
      const errorMessage = handleApiError(error);
      console.error('Failed to create watch:', errorMessage);
    },
  });
};

/**
 * Update an existing watch
 */
export const useUpdateWatch = () => {
  const queryClient = useQueryClient();

  type UpdateWatchVariables = { 
    id: string; 
    formData: Partial<WatchFormData>; 
    images?: WatchImageFiles 
  };

  return useMutation<Watch, AxiosError, UpdateWatchVariables>({
    mutationFn: ({ id, formData, images }) => 
      watchServices.updateWatch(id, formData, images),
    
    onSuccess: (updatedWatch: Watch, variables: UpdateWatchVariables) => {
      // Update the specific watch in the cache
      queryClient.setQueryData(queryKeys.watches.detail(variables.id), updatedWatch);
      
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.watches.lists() });
      
      // Invalidate featured watches if feature status might have changed
      if (variables.formData.isfeatured !== undefined) {
        queryClient.invalidateQueries({ queryKey: queryKeys.watches.featured() });
      }
      
      // Invalidate category queries if category changed
      if (variables.formData.category) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.watches.byCategory(variables.formData.category) 
        });
      }
      
      // Invalidate series queries if series changed
      if (variables.formData.series) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.watches.bySeries(variables.formData.series) 
        });
      }

      console.log('Watch updated successfully:', updatedWatch);
    },
    
    onError: (error: AxiosError, variables: UpdateWatchVariables) => {
      const errorMessage = handleApiError(error);
      console.error(`Failed to update watch ${variables.id}:`, errorMessage);
    },
  });
};

/**
 * Delete a watch
 */
export const useDeleteWatch = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, string>({
    mutationFn: (id: string) => watchServices.deleteWatch(id),
    
    onSuccess: (_: void, deletedId: string) => {
      // Remove the watch from all relevant queries
      queryClient.removeQueries({ queryKey: queryKeys.watches.detail(deletedId) });
      
      // Invalidate all list queries to ensure the deleted watch is removed
      queryClient.invalidateQueries({ queryKey: queryKeys.watches.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.watches.featured() });
      
      // Invalidate category and series queries
      queryClient.invalidateQueries({ 
        predicate: (query: any) => {
          const key = query.queryKey;
          return (
            key.includes('watches') && 
            (key.includes('category') || key.includes('series'))
          );
        }
      });

      console.log('Watch deleted successfully:', deletedId);
    },
    
    onError: (error: AxiosError, deletedId: string) => {
      const errorMessage = handleApiError(error);
      console.error(`Failed to delete watch ${deletedId}:`, errorMessage);
    },
  });
};

// =================
// UTILITY HOOKS
// =================

/**
 * Prefetch a watch for better UX (e.g., on hover)
 */
export const usePrefetchWatch = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.watches.detail(id),
      queryFn: () => watchServices.getWatchById(id),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };
};

/**
 * Get watch data from cache without triggering a request
 */
export const useWatchFromCache = (id: string) => {
  const queryClient = useQueryClient();
  
  return queryClient.getQueryData<Watch>(queryKeys.watches.detail(id));
};

/**
 * Optimistically update watch in cache (useful for UI feedback)
 */
export const useOptimisticWatchUpdate = () => {
  const queryClient = useQueryClient();

  return {
    updateWatch: (id: string, updater: (old: Watch | undefined) => Watch) => {
      queryClient.setQueryData(queryKeys.watches.detail(id), updater);
    },
    revertWatch: (id: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watches.detail(id) });
    },
  };
};

/**
 * Batch invalidate watch-related queries
 */
export const useInvalidateWatches = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watches.all() });
    },
    invalidateLists: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watches.lists() });
    },
    invalidateDetails: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watches.details() });
    },
    invalidateWatch: (id: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watches.detail(id) });
    },
  };
};
