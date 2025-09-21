'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { UserProvider } from '../contexts/UserContext';
import { WatchCacheProvider } from '../contexts/WatchCacheContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <WatchCacheProvider>
          {children}
        </WatchCacheProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
