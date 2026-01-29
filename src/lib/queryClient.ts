import { QueryClient } from "@tanstack/react-query";

// Centralized QueryClient configuration with optimized caching defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 2 minutes by default
      staleTime: 1000 * 60 * 2,
      // Keep unused data in cache for 30 minutes
      gcTime: 1000 * 60 * 30,
      // Don't refetch on window focus to reduce unnecessary requests
      refetchOnWindowFocus: false,
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on reconnect for better UX
      refetchOnReconnect: false,
    },
  },
});
