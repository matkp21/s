
// src/hooks/use-ai-agent.ts
"use client";

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// T is the input type of the agent function, R is the return type
type AgentFunction<T, R> = (input: T) => Promise<R>;

interface UseAiAgentOptions<T, R> {
  onSuccess?: (data: R, input: T) => void;
  onError?: (error: string, input: T) => void;
  successMessage?: string;
}

// Return type is extended to include 'execute' for clarity, which is the mutate function.
type AiAgentMutationResult<T, R> = UseMutationResult<R, Error, T> & { execute: UseMutationResult<R, Error, T>['mutate'] };

export function useAiAgent<T, R>(
  agentFunction: AgentFunction<T, R>,
  options?: UseAiAgentOptions<T, R>
): AiAgentMutationResult<T, R> {
  const { toast } = useToast();

  const mutation = useMutation<R, Error, T>({
    mutationFn: agentFunction,
    onSuccess: (data, variables) => {
      if (options?.onSuccess) {
        options.onSuccess(data, variables);
      } else if (options?.successMessage) {
        toast({
          title: "Success!",
          description: options.successMessage,
        });
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
  
  return { ...mutation, execute: mutation.mutate };
}
