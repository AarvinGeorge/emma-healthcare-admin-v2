/**
 * EMMA Healthcare React Query Provider
 * 
 * Configures React Query (TanStack Query) for data fetching, caching,
 * and state management with healthcare-specific settings.
 */

'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Create a client with healthcare-optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Healthcare data should be fresh - shorter stale times
      staleTime: 60 * 1000, // 1 minute
      // Cache for longer to avoid unnecessary re-fetches
      gcTime: 300 * 1000, // 5 minutes (was cacheTime in older versions)
      // Retry failed requests (important for medical data)
      retry: 2,
      // Background refetch for real-time updates
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      // For resident/patient data, be conservative with network retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations for critical operations
      retry: 1,
      retryDelay: 1000,
    },
  },
})

interface ReactQueryProviderProps {
  children: React.ReactNode
}

const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}

export default ReactQueryProvider