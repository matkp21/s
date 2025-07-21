// src/components/medico/smart-search.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, BookCheck, HelpCircle } from 'lucide-react';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { searchAndSummarize } from '@/ai/agents/medico/SmartSearchAgent';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import { Badge } from '@/components/ui/badge';
import { runIndexer } from '@/ai/retrievers/smart-search-retriever';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  query: z.string().min(5, { message: "Query must be at least 5 characters." }),
});

type SearchFormValues = z.infer<typeof formSchema>;

export default function SmartSearch() {
  const [isIndexing, setIsIndexing] = useState(true);
  const [indexingError, setIndexingError] = useState<string | null>(null);

  const { mutate: runSearch, data: searchResult, isPending: isLoading, error } = useAiAgent(searchAndSummarize);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: "" },
  });

  useEffect(() => {
    // Run the indexer when the component mounts
    async function indexData() {
        const result = await runIndexer();
        if (!result.success) {
            setIndexingError(result.message);
        }
        setIsIndexing(false);
    }
    indexData();
  }, []);

  const onSubmit: SubmitHandler<SearchFormValues> = async (data) => {
    await runSearch(data);
  };
  
  if (isIndexing) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-sm font-semibold">Preparing Knowledge Base...</p>
            <p className="text-xs">This may take a moment on first load.</p>
        </div>
    );
  }
  
  if (indexingError) {
     return (
        <Alert variant="destructive" className="rounded-lg">
          <AlertTitle>Indexing Failed</AlertTitle>
          <AlertDescription>{indexingError}</AlertDescription>
        </Alert>
      );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="smart-search-query" className="text-base">Ask a Clinical Question</FormLabel>
                <FormControl>
                  <Input
                    id="smart-search-query"
                    placeholder="e.g., What is the first-line treatment for HFrEF?"
                    className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</>
            ) : (
              <><Search className="mr-2 h-4 w-4" /> Smart Search</>
            )}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {searchResult && (
        <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-xl text-foreground flex items-center gap-2">
                <BookCheck className="h-6 w-6 text-primary"/>
                Grounded Answer
            </h3>
            <div className="p-4 border rounded-lg bg-muted/30">
                <MarkdownRenderer content={searchResult.answer} />
            </div>
            
            {searchResult.sources && searchResult.sources.length > 0 && (
                <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Sources Consulted:</h4>
                    <div className="flex flex-wrap gap-2">
                        {searchResult.sources.map((source, index) => (
                            <Badge key={index} variant="secondary">{source.split('/').pop()}</Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}
       {!searchResult && !isLoading && (
        <div className="text-center py-10 text-muted-foreground bg-card/50 p-6 rounded-xl shadow-inner border">
          <HelpCircle className="h-12 w-12 mx-auto mb-3 text-primary/50" />
          <p className="font-semibold">Ask a question to get an AI-powered answer.</p>
          <p className="text-sm">The response will be grounded in our local knowledge base.</p>
        </div>
      )}
    </div>
  );
}
