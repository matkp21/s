
// src/components/guideline-retrieval/guideline-query-form.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { retrieveGuidelines, type GuidelineRetrievalInput, type GuidelineRetrievalOutput } from '@/ai/agents/GuidelineRetrievalAgent';
import { useToast } from '@/hooks/use-toast';
import { Search, Send, Loader2 } from 'lucide-react';
import { GuidelineRetrievalInputSchema } from '@/ai/schemas/guideline-retrieval-schemas';
import { useAiAgent } from '@/hooks/use-ai-agent';


type GuidelineQueryFormValues = z.infer<typeof GuidelineRetrievalInputSchema>;

interface GuidelineQueryFormProps {
  onRetrievalComplete: (result: GuidelineRetrievalOutput | null, error?: string) => void;
  setIsLoading: (loading: boolean) => void; // Can be controlled by useAiAgent now
  isLoading: boolean; 
}

export function GuidelineQueryForm({ onRetrievalComplete, setIsLoading, isLoading }: GuidelineQueryFormProps) {
  const { toast } = useToast();
  const form = useForm<GuidelineQueryFormValues>({
    resolver: zodResolver(GuidelineRetrievalInputSchema),
    defaultValues: {
      query: "",
    },
  });

  const { mutate: runRetrieveGuidelines, isPending } = useAiAgent<GuidelineRetrievalInput, GuidelineRetrievalOutput>(retrieveGuidelines, {
    onSuccess: (result) => {
      onRetrievalComplete(result);
      if (result.results && result.results.length > 0) {
        toast({
            title: "Retrieval Complete",
            description: `Found ${result.results.length} guideline(s).`,
        });
      } else {
        toast({
            title: "No Results",
            description: "No specific guidelines found for your query.",
            variant: "default"
        });
      }
    },
    onError: (errorMessage) => {
      onRetrievalComplete(null, errorMessage);
      toast({
        title: "Retrieval Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<GuidelineQueryFormValues> = async (data) => {
    onRetrievalComplete(null); 
    runRetrieveGuidelines(data);
  };
  
  // Keep isLoading in sync with the hook's pending state
  React.useEffect(() => {
    setIsLoading(isPending);
  }, [isPending, setIsLoading]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="input-focus-glow rounded-lg">
              <FormLabel htmlFor="guideline-query-input" className="text-foreground/90">Medical Topic or Condition</FormLabel>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true"/>
                <FormControl>
                  <Input
                    id="guideline-query-input"
                    placeholder="e.g., 'treatment for type 2 diabetes', 'Thalassemia Major'"
                    className="pl-10 rounded-lg border-border/70 focus:border-primary"
                    aria-describedby="guideline-query-description"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormDescription id="guideline-query-description">
                Enter a topic to search for related guidelines or educational information.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full rounded-lg py-3 text-base group" disabled={isPending} aria-label="Retrieve medical guidelines and information">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
             <>
              Retrieve Information
              <Send className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
             </>
          )}
        </Button>
      </form>
    </Form>
  );
}
