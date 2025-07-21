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

export function useAiAgent<T, R>(
  agentFunction: AgentFunction<T, R>,
  // We can pass the Zod schema for response validation
  responseSchema?: z.ZodType<R>,
  options?: UseAiAgentOptions<T, R>
): UseMutationResult<R, Error, T> {
  const { toast } = useToast();

  return useMutation<R, Error, T>({
    mutationFn: async (input: T) => {
      const result = await agentFunction(input);
      // Validate the response against the Zod schema if provided
      if (responseSchema) {
        const validation = responseSchema.safeParse(result);
        if (!validation.success) {
          console.error("Zod validation failed for AI agent response:", validation.error);
          throw new Error("The AI returned data in an unexpected format. Please try again.");
        }
        return validation.data;
      }
      return result;
    },
    
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
}
