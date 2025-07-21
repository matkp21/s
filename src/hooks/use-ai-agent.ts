// src/hooks/use-ai-agent.ts
"use client";

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useProMode } from '@/contexts/pro-mode-context';

// T is the input type of the agent function, R is the return type
type AgentFunction<T, R> = (input: T) => Promise<R>;

interface UseAiAgentOptions<T, R> {
  onSuccess?: (data: R, input: T) => void;
  onError?: (error: string, input: T) => void;
  successMessage?: string;
  cacheKey?: string | ((input: T) => (string | number)[]); // Function to generate a dynamic query key for caching
}

// The hook now returns the result from TanStack Query's useMutation
export function useAiAgent<T, R>(
  agentFunction: AgentFunction<T, R>,
  options?: UseAiAgentOptions<T, R>
): UseMutationResult<R, Error, T> {
  const { toast } = useToast();
  const { user } = useProMode(); // Get user status for conditional caching
  const queryClient = useQueryClient();

  return useMutation<R, Error, T>({
    // Define the mutation function that will be called
    mutationFn: agentFunction,
    
    // When the mutation is successful
    onSuccess: (data, variables) => {
      // Invalidate relevant queries if needed, or handle success
      // For our use case, we might pre-populate a cache if using useQuery later
      // For now, onSuccess callback is sufficient
      if (options?.onSuccess) {
        options.onSuccess(data, variables);
      } else if (options?.successMessage) {
        toast({
          title: "Success!",
          description: options.successMessage,
        });
      }

      // If a cacheKey is provided, we can update the query cache
      if (options?.cacheKey) {
        const queryKey = typeof options.cacheKey === 'function' ? options.cacheKey(variables) : [options.cacheKey, variables];
        queryClient.setQueryData(queryKey, data);
      }
    },
    
    // When the mutation fails
    onError: (error, variables) => {
      const errorMessage = error.message || "An unknown error occurred.";
      if (options?.onError) {
        options.onError(errorMessage, variables);
      } else {
        toast({
          title: "An Error Occurred",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    
    // Use the user's login status to determine if we should cache results
    // This isn't a direct option in useMutation, but we'd handle it via queryClient invalidation
    // or by choosing not to `setQueryData` if the user is a guest.
    // The core benefit of useMutation is standardized state management (isLoading, error, data).
    // Actual caching is better managed with `useQuery` which we are not using directly here.
    // The key change is migrating from useState to useMutation for better-managed state.
  });
}
