'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { hydrateAuth } from '@/store/slices/authSlice';
import { hydrateTheme } from '@/store/slices/themeSlice';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // Trigger client-side hydration of localStorage states
  useEffect(() => {
    store.dispatch(hydrateAuth());
    store.dispatch(hydrateTheme());
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
