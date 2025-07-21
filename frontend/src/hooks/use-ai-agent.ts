
"use client";

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// T is the input type of the agent function, R is the return type
type AgentFunction<T, R> = (input: T) => Promise<R>;

interface UseAiAgentResult<T, R> {
  execute: (input: T) => Promise<void>;
  data: R | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useAiAgent<T, R>(
  agentFunction: AgentFunction<T, R>,
  options?: {
    onSuccess?: (data: R, input: T) => void;
    onError?: (error: string) => void;
    successMessage?: string;
  }
): UseAiAgentResult<T, R> {
  const [data, setData] = useState<R | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const execute = useCallback(async (input: T) => {
    setIsLoading(true);
    setError(null);
    // Do not clear previous data here to prevent UI flicker
    // setData(null); 

    try {
      const result = await agentFunction(input);
      setData(result);
      if (options?.onSuccess) {
        options.onSuccess(result, input);
      } else if (options?.successMessage) {
        toast({
            title: "Success!",
            description: options.successMessage,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      if (options?.onError) {
        options.onError(errorMessage);
      } else {
        toast({
          title: "An Error Occurred",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [agentFunction, options, toast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { execute, data, isLoading, error, reset };
}
