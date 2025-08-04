// hooks/useWatchApi.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { protectedApiClient, handleApiError } from '@/lib/api-clients';
import { AxiosError } from 'axios';

// Types for the watch creation
export interface WatchFormData {
  name: string;
  description: string;
  characteristics: string;
  actualprice: number;
  offerprice: number;
  offerpercentage: number;
  rating: number;
  reviewscount: number;
  category: string;
  series: string;
  modelgroup: string;
  releasedate: string;
  theme: string;
  warrantyperiod: string;
  stockavailability: string;
  isfeatured: boolean;
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
  rating: number;
  reviewscount: number;
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

// Query keys for cache management
export const watchQueryKeys = {
  all: ['watches'] as const,
  lists: () => [...watchQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...watchQueryKeys.lists(), filters] as const,
  details: () => [...watchQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...watchQueryKeys.details(), id] as const,
} as const;

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




