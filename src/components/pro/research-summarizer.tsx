
// src/components/pro/research-summarizer.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Library, BookOpen, Lightbulb, Search, Loader2, FileText } from 'lucide-react';
import { retrieveGuidelines, type GuidelineRetrievalInput, type GuidelineRetrievalOutput } from '@/ai/agents/GuidelineRetrievalAgent';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { MarkdownRenderer } from '../markdown/markdown-renderer';

export function ResearchSummarizer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaries, setSummaries] = useState<GuidelineRetrievalOutput | null>(null);
  const { toast } = useToast();

  const handleSearchAndSummarize = async () => {
    if (!searchTerm.trim()) {
      toast({ title: "Search term required", description: "Please enter a clinical question or topic.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSummaries(null);
    
    try {
      const input: GuidelineRetrievalInput = { query: searchTerm };
      const result = await retrieveGuidelines(input);
      setSummaries(result);
      if (!result.results || result.results.length === 0) {
        toast({ title: "No relevant articles found", description: `Could not find literature for "${searchTerm}".`, variant: "default" });
      } else {
         toast({ title: "Summaries Retrieved", description: `Found and summarized ${result.results.length} article(s).` });
      }
    } catch (error) {
       console.error("Research summarization error:", error);
       toast({ title: "Search Failed", description: (error as Error).message || "Unknown error while fetching literature.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-teal-500/50 bg-teal-500/10">
            <Lightbulb className="h-5 w-5 text-teal-600" />
            <AlertTitle className="font-semibold text-teal-700 dark:text-teal-500">AI Literature Search</AlertTitle>
            <AlertDescription className="text-teal-600/90 dark:text-teal-500/90 text-xs">
              This tool uses AI to search for and summarize relevant medical literature and guidelines. Always verify with original sources.
            </AlertDescription>
      </Alert>

      <Card className="shadow-md rounded-xl border-cyan-500/30 bg-gradient-to-br from-card via-card to-cyan-500/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Library className="h-6 w-6 text-cyan-600" />
            AI-Powered Research &amp; Literature Summarizer
          </CardTitle>
          <CardDescription>Enter a clinical question or topic to find and summarize relevant medical literature.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Search by condition, drug, or clinical question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg flex-grow border-border/70 focus:border-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleSearchAndSummarize()}
              aria-label="Search for medical literature"
            />
            <Button onClick={handleSearchAndSummarize} disabled={isLoading} className="rounded-lg">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              <span className="sr-only sm:not-sr-only sm:ml-2">Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
         <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Searching and summarizing literature...</p>
        </div>
      )}

       {!isLoading && summaries && (
        <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Summarized Articles for "{searchTerm}"</h3>
            <ScrollArea className="h-[50vh] p-1 border rounded-lg bg-background">
                <div className="p-3 space-y-4">
                {summaries.results.length > 0 ? summaries.results.map((article, index) => (
                    <Card key={index} className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-md hover:text-primary transition-colors">
                           {article.title}
                        </CardTitle>
                        {article.source && (
                          <CardDescription className="text-xs">
                          Source: {article.source}
                          </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                            <MarkdownRenderer content={article.summary} />
                        </div>
                    </CardContent>
                    </Card>
                )) : (
                     <div className="text-center py-10 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-primary/50" />
                        <p className="font-semibold">No articles found.</p>
                        <p className="text-sm">Try a different search term.</p>
                    </div>
                )}
                </div>
            </ScrollArea>
        </div>
      )}
    </div>
  );
}
