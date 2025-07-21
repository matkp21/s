// src/components/medico/KnowledgeHubSearch.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function KnowledgeHubSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: "Search Term Required",
        description: "Please enter a topic to search or generate notes for.",
        variant: "destructive"
      });
      return;
    }
    // For now, this search bar's primary action is to generate notes
    // A future implementation would use Algolia/full-text search on the user's library
    router.push(`/medico/theorycoach-generator?topic=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative mt-4">
      <form onSubmit={handleSearch}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your Knowledge Hub or generate new notes..."
          className="w-full pl-12 pr-28 py-3 h-14 text-lg rounded-lg shadow-inner bg-background/50 border-border/50 focus-visible:ring-primary/80"
        />
        <Button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md h-10 px-4 group"
        >
          <Sparkles className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          Generate
        </Button>
      </form>
    </div>
  );
}
