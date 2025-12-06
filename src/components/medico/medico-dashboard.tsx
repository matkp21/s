// src/components/medico/medico-dashboard.tsx
"use client";

import React, { useState, Suspense, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  CheckSquare, Settings, Loader2, Star, BrainCircuit
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { allMedicoToolsList } from '@/config/medico-tools-config';
import type { MedicoTool, ActiveToolId } from '@/types/medico-tools';
import { MedicoToolCard } from '@/components/medico/medico-tool-card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NeuralProgress } from "@/components/medico/NeuralProgress";
import { KnowledgeHubSearch } from '@/components/medico/KnowledgeHubSearch';
import { HeroWidgets, type HeroTask } from '@/components/homepage/hero-widgets';
import { addDays } from 'date-fns';
import { useRouter } from 'next/navigation';

const sampleMedicoTasks: HeroTask[] = [
    { id: 'task-med-1', date: new Date(), title: 'Review Anatomy Lecture', description: 'Focus on brachial plexus.' },
    { id: 'task-med-2', date: new Date(), title: 'Cardiology Ward Rounds', description: '10:00 AM, Ward B.' },
    { id: 'task-med-3', date: addDays(new Date(), 1), title: 'Pharmacology Quiz Prep', description: 'Study adrenergic drugs.' },
    { id: 'task-med-4', date: addDays(new Date(), 2), title: 'Submit Case Presentation Draft', description: 'Topic: Acute Pancreatitis.' },
];

function MedicoDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isEditMode, setIsEditMode] = useState(false);
    const [displayedTools, setDisplayedTools] = useState<MedicoTool[]>(allMedicoToolsList);
    
    const handleLaunchTool = (href?: string) => {
        if (href) {
            router.push(href);
        }
    };

    const frequentlyUsedToolIds = useMemo(() => allMedicoToolsList
        .filter(t => t.isFrequentlyUsed)
        .map(t => t.id), []);

    const frequentlyUsedTools = useMemo(() => displayedTools.filter(tool => frequentlyUsedToolIds.includes(tool.id)), [displayedTools, frequentlyUsedToolIds]);
    const otherTools = useMemo(() => displayedTools.filter(tool => !frequentlyUsedToolIds.includes(tool.id)), [displayedTools, frequentlyUsedToolIds]);
    

     return (
          <div className="container mx-auto py-8">
              <div className="flex justify-between items-center mb-6">
                  <div className="text-left">
                      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1 firebase-gradient-text">Medico Study Hub</h1>
                      <p className="text-md text-muted-foreground">
                      Your AI-powered command center for acing medical studies.
                      </p>
                  </div>
                  <Button variant="outline" onClick={() => setIsEditMode(!isEditMode)} size="sm" className="rounded-lg group">
                  {isEditMode ? <CheckSquare className="mr-2 h-4 w-4"/> : <Settings className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-45"/>}
                  {isEditMode ? 'Save Layout' : 'Customize'}
                  </Button>
              </div>
              
              <div className="mb-8">
                  <HeroWidgets tasks={sampleMedicoTasks} />
              </div>

              <div className="mb-10">
                  <NeuralProgress />
                  <KnowledgeHubSearch />
              </div>
              
              <div className="mt-10">
                  {isEditMode ? (
                  <>
                      <div className="p-4 mb-6 border border-dashed border-primary/50 rounded-lg bg-primary/5 text-center">
                          <p className="text-sm text-primary">
                              Customize Dashboard: Drag and drop the tool cards below to reorder your dashboard.
                          </p>
                      </div>
                      <Reorder.Group
                      as="div"
                      values={displayedTools}
                      onReorder={setDisplayedTools}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                      >
                      {displayedTools.map((tool) => (
                          <Reorder.Item key={tool.id} value={tool} layout>
                            <MedicoToolCard 
                              tool={tool}
                              onLaunch={handleLaunchTool}
                              isFrequentlyUsed={frequentlyUsedToolIds.includes(tool.id)} 
                              isEditMode={isEditMode} 
                            />
                          </Reorder.Item>
                      ))}
                      </Reorder.Group>
                  </>
                  ) : (
                  <>
                      {frequentlyUsedTools.length > 0 && (
                      <section className="mb-10">
                          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                          <Star className="mr-2 h-6 w-6 text-yellow-400 fill-yellow-400"/> Frequently Used
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {frequentlyUsedTools.map((tool) => (
                             <MedicoToolCard 
                               key={`${tool.id}-freq-card`}
                               tool={tool}
                               onLaunch={handleLaunchTool}
                               isFrequentlyUsed={true}
                               isEditMode={isEditMode}
                             />
                          ))}
                          </div>
                      </section>
                      )}

                      <section>
                      <h2 className="text-2xl font-semibold text-foreground mb-5">All Medico Tools</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                          {otherTools.map((tool) => (
                             <MedicoToolCard 
                               key={`${tool.id}-card`}
                               tool={tool} 
                               onLaunch={handleLaunchTool} 
                               isEditMode={isEditMode} 
                             />
                          ))}
                      </div>
                      </section>
                  </>
                  )}
              </div>
          </div>
    );
}

export function MedicoDashboard() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <MedicoDashboardContent />
    </Suspense>
  )
}
