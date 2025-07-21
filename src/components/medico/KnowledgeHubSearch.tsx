// src/components/medico/KnowledgeHubSearch.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Wand2 } from 'lucide-react';
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
    router.push(`/medico/notes-generator?topic=${encodeURIComponent(query)}`);
  };
  
  const handleTagClick = (tag: string) => {
    setQuery(tag);
    router.push(`/medico/notes-generator?topic=${encodeURIComponent(tag)}`);
  }

  const quickTags = ["Cardiac Rhythms", "Molecular Biology", "Immunology"];

  return (
    <div className="mt-4 space-y-3">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your library or generate new study material..."
          className="w-full pl-12 pr-32 py-3 h-14 text-base rounded-full shadow-inner bg-background/70 border-border/60 focus-visible:ring-primary/80"
        />
        <Button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-10 px-5 group"
        >
          <Wand2 className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          Generate
        </Button>
      </form>

       <div className="flex flex-wrap gap-2 justify-center px-4">
        {quickTags.map(tag => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className="bg-gradient-to-r from-sky-600 to-cyan-500 px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
