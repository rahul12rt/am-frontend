// hooks/useWatchApi.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { protectedApiClient, handleApiError } from '@/lib/api-clients';
import { AxiosError } from 'axios';

// Types for the watch creation and updates
export interface WatchFormData {
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

export interface UpdateWatchFormData extends Partial<WatchFormData> {
  // All fields are optional for updates
}

export interface WatchImages {
  isoview?: File;
  front?: File;
  back?: File;
  side?: File;
  strap?: File;
  closeup?: File;
  dial?: File;
}

export interface CreateWatchPayload {
  formData: WatchFormData;
  images: WatchImages;
}

export interface UpdateWatchPayload {
  id: string;
  formData: UpdateWatchFormData;
  images?: WatchImages; // Images are optional for updates
}

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
  createdAt: string;
  updatedAt: string;
  WatchImages: WatchImage[];
}

export interface CreateWatchResponse {
  success: boolean;
  message: string;
  data: Watch;
}

export interface UpdateWatchResponse {
  success: boolean;
  message: string;
  data: Watch;
}

// Query keys for cache management
export const watchQueryKeys = {
  all: ['watches'] as const,
  lists: () => [...watchQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...watchQueryKeys.lists(), filters] as const,
  details: () => [...watchQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...watchQueryKeys.details(), id] as const,
} as const;

// ============= CREATE WATCH =============

// API function to create a watch with images
const createWatch = async ({ formData, images }: CreateWatchPayload): Promise<CreateWatchResponse> => {
  const formPayload = new FormData();
  
  // Append form data
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formPayload.append(key, value.toString());
    }
  });
  
  // Append image files
  Object.entries(images).forEach(([key, file]) => {
    if (file && file instanceof File) {
      formPayload.append(key, file);
    }
  });

  const response = await protectedApiClient.post<CreateWatchResponse>('/watches', formPayload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000, // 30 seconds for file upload
  });

  return response.data;
};

// Hook for creating a watch
export const useCreateWatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWatch,
    onSuccess: (data) => {
      // Invalidate and refetch watch lists
      queryClient.invalidateQueries({ queryKey: watchQueryKeys.lists() });
      
      // Add the new watch to the cache
      queryClient.setQueryData(
        watchQueryKeys.detail(data.data.id),
        data.data
      );

      console.log('Watch created successfully:', data.data);
    },
    onError: (error: AxiosError) => {
      const errorMessage = handleApiError(error);
      console.error('Failed to create watch:', errorMessage);
    },
  });
};

// ============= UPDATE WATCH =============

// API function to update a watch with optional images
const updateWatch = async ({ id, formData, images }: UpdateWatchPayload): Promise<UpdateWatchResponse> => {
  const formPayload = new FormData();
  
  // Append form data (only fields that are provided)
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formPayload.append(key, value.toString());
    }
  });
  
  // Append image files if provided
  if (images) {
    Object.entries(images).forEach(([key, file]) => {
      if (file && file instanceof File) {
        formPayload.append(key, file);
      }
    });
  }

  const response = await protectedApiClient.put<UpdateWatchResponse>(`/watches/${id}`, formPayload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000, // 30 seconds for file upload
  });

  return response.data;
};

// Hook for updating a watch (with optional images)
export const useUpdateWatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWatch,
    onSuccess: (data, variables) => {
      // Invalidate and refetch watch lists
      queryClient.invalidateQueries({ queryKey: watchQueryKeys.lists() });
      
      // Update the specific watch in the cache
      queryClient.setQueryData(
        watchQueryKeys.detail(variables.id),
        data.data
      );

      // Also invalidate the specific watch detail to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: watchQueryKeys.detail(variables.id) 
      });

      console.log('Watch updated successfully:', data.data);
    },
    onError: (error: AxiosError, variables) => {
      const errorMessage = handleApiError(error);
      console.error(`Failed to update watch ${variables.id}:`, errorMessage);
    },
  });
};

// ============= GET WATCH DETAILS =============

// API function to get a single watch by ID
const getWatchById = async (id: string): Promise<Watch> => {
  const response = await protectedApiClient.get<{
    success: boolean;
    message: string;
    data: Watch;
  }>(`/watches/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch watch details');
  }

  return response.data.data;
};

// Hook for getting watch details by ID - useQuery IS REQUIRED
export const useGetWatchById = (id: string) => {
  

  return useQuery({
    queryKey: watchQueryKeys.detail(id),
    queryFn: () => getWatchById(id),
    enabled: !!id, // Only run query if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error instanceof AxiosError && error.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

