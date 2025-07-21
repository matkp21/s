// src/hooks/use-ai-agent.ts
"use client";

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// T is the input type of the agent function, R is the return type
type AgentFunction<T, R> = (input: T) => Promise<R>;

interface UseAiAgentOptions<T, R> {
  onSuccess?: (data: R, input: T) => void;
  onError?: (error: string, input: T) => void;
}

export function useAiAgent<T, R>(
  agentFunction: AgentFunction<T, R>,
  options?: UseAiAgentOptions<T, R>
): UseMutationResult<R, Error, T> {
  const { toast } = useToast();

  const mutation = useMutation<R, Error, T>({
    mutationFn: agentFunction,
    onSuccess: (data, variables) => {
      if (options?.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
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
  });
  
  // Directly return the result from useMutation which includes data, error, isPending (isLoading)
  return mutation;
}
