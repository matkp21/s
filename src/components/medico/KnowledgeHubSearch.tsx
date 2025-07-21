
// src/components/medico/KnowledgeHubSearch.tsx
"use client";

import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  useSearchBox,
  useHits,
  useInstantSearch,
} from 'react-instantsearch-hooks-web';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

// Setup Algolia client - It's safe to use public keys on the client-side for search-only operations.
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const searchApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '';
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'medico_knowledge_hub';

// Conditional initialization to prevent errors if keys are missing
const searchClient = appId && searchApiKey ? algoliasearch(appId, searchApiKey) : null;

function CustomSearchBox(props: React.ComponentProps<'div'>) {
  const { query, refine, clear, isSearchStalled } = useSearchBox();

  return (
    <div className={cn("relative", props.className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => refine(e.target.value)}
        placeholder="Search saved notes, MCQs, mnemonics..."
        className="w-full pl-10 pr-10 py-3 text-base rounded-lg shadow-inner bg-background/50 border-border/50"
      />
      {query && (
        <Button
          variant="ghost"
          size="iconSm"
          onClick={clear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
       {isSearchStalled && <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />}
    </div>
  );
}

function CustomHits() {
  const { hits, results } = useHits();
  const { status } = useInstantSearch();

  if (status === 'stalled') {
    return null; // SearchBox shows a loader
  }

  if (status !== 'loading' && results?.query && hits.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-muted-foreground">No results found for &quot;{results.query}&quot;.</p>
        <p className="text-xs mt-2">You can use the AI tools below to generate new content on this topic.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-64 mt-2">
      <div className="space-y-1 p-1">
        {hits.map((hit: any) => (
           <motion.div
            key={hit.objectID}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-2 rounded-md hover:bg-muted/50 cursor-pointer"
            role="button"
            // TODO: Add onClick handler to open a dialog with the hit details
          >
            <p className="text-sm font-medium text-foreground">{hit.topic}</p>
            <p className="text-xs text-muted-foreground capitalize">{hit.type}</p>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function KnowledgeHubSearch() {
   if (!searchClient) {
    return (
        <div className="mt-4">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Search Not Configured</AlertTitle>
                <AlertDescription>
                    Algolia credentials are not set in the environment variables. Please configure NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY, and NEXT_PUBLIC_ALGOLIA_INDEX_NAME.
                </AlertDescription>
            </Alert>
        </div>
    )
  }
  
  return (
    <div className="relative mt-4">
      <InstantSearch searchClient={searchClient} indexName={indexName}>
        <CustomSearchBox />
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="absolute top-full left-0 right-0 z-20 mt-1"
            >
                <Card className="shadow-lg border-border/70">
                    <CardContent className="p-2">
                        <CustomHits />
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
      </InstantSearch>
    </div>
  );
}
