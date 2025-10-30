
// src/components/pro/treatment-protocol-navigator.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardCheck, BookOpen, Lightbulb, ChevronRight, ArrowLeft } from 'lucide-react';
import { type GuidelineRetrievalOutput, type GuidelineItem } from '@/ai/agents/GuidelineRetrievalAgent';
import { GuidelineQueryForm } from '../guideline-retrieval/guideline-query-form'; // Reusing this form
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function TreatmentProtocolNavigator() {
  const [searchResults, setSearchResults] = useState<GuidelineRetrievalOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<GuidelineItem | null>(null);
  const { toast } = useToast();

  const handleRetrievalComplete = (result: GuidelineRetrievalOutput | null, error?: string) => {
    setSearchResults(result);
    if (error) {
        toast({ title: "Search Failed", description: error, variant: "destructive" });
    }
  };

  const handleSelectProtocol = (protocol: GuidelineItem) => {
    setSelectedProtocol(protocol);
  };
  
  const handleBackToList = () => {
    setSelectedProtocol(null);
  };
  
  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-green-500/50 bg-green-500/10">
        <Lightbulb className="h-5 w-5 text-green-600" />
        <AlertTitle className="font-semibold text-green-700 dark:text-green-500">Evidence-Based Guidance</AlertTitle>
        <AlertDescription className="text-green-600/90 dark:text-green-500/90 text-xs">
          Access AI-summarized treatment guidelines and protocols. Always cross-reference with full official documents and apply clinical judgment.
        </AlertDescription>
      </Alert>

      {!selectedProtocol ? (
        <Card className="shadow-md rounded-xl border-green-500/30 bg-gradient-to-br from-card via-card to-green-500/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-green-600" />
              Treatment Protocol Navigator
            </CardTitle>
            <CardDescription>Search for evidence-based treatment guidelines and protocols.</CardDescription>
          </CardHeader>
          <CardContent>
            <GuidelineQueryForm
              onRetrievalComplete={handleRetrievalComplete}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
            />
            {searchResults && searchResults.results.length > 0 && (
                 <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Search Results</h3>
                    <ScrollArea className="h-64 p-1 border rounded-md">
                        <div className="space-y-2 p-2">
                            {searchResults.results.map((item, index) => (
                               <div 
                                    key={index}
                                    className="p-3 bg-muted/50 rounded-lg hover:bg-muted/80 cursor-pointer transition-colors border border-border/50 hover:border-primary/50"
                                    onClick={() => handleSelectProtocol(item)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-semibold text-md text-primary">{item.title}</h4>
                                            {item.source && <p className="text-xs text-muted-foreground mt-0.5">Source: {item.source}</p>}
                                            <p className="text-xs text-foreground/80 line-clamp-2 mt-1">{item.summary}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2"/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6 shadow-lg rounded-xl border-primary/30">
            <CardHeader>
                <Button variant="outline" size="sm" onClick={handleBackToList} className="mb-3 text-xs rounded-md self-start group">
                 <ArrowLeft className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"/> Back to Results
                </Button>
                <CardTitle className="text-xl flex items-center gap-2 text-primary">
                    <BookOpen className="h-6 w-6" />
                    {selectedProtocol.title}
                </CardTitle>
                {selectedProtocol.source && <CardDescription className="text-sm pt-1">Source: {selectedProtocol.source}</CardDescription>}
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-[60vh] p-1 border bg-background rounded-lg">
                    <div className="p-4 whitespace-pre-wrap text-sm prose prose-sm dark:prose-invert max-w-none">
                        <h4 className="font-semibold text-base mb-2">Summary:</h4>
                        <p>{selectedProtocol.summary}</p>

                        {selectedProtocol.investigations && selectedProtocol.investigations.length > 0 && (
                            <>
                                <h4 className="font-semibold text-base mt-4 mb-2">Key Investigations:</h4>
                                <ul className="list-disc list-inside">
                                    {selectedProtocol.investigations.map((inv, idx) => <li key={idx}>{inv}</li>)}
                                </ul>
                            </>
                        )}
                        {selectedProtocol.management && selectedProtocol.management.length > 0 && (
                            <>
                                <h4 className="font-semibold text-base mt-4 mb-2">Key Management Steps:</h4>
                                <ul className="list-disc list-inside">
                                    {selectedProtocol.management.map((step, idx) => <li key={idx}>{step}</li>)}
                                </ul>
                            </>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground italic">This is an AI-generated summary. Always refer to the full official guideline for complete information.</p>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}
