// src/components/medico/medico-tool-card.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, Star, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { DialogTrigger } from '@/components/ui/dialog';
import type { MedicoTool, ActiveToolId } from '@/types/medico-tools';
import Link from 'next/link';

interface MedicoToolCardProps {
  tool: MedicoTool;
  onLaunch: (toolId: ActiveToolId, topic?: string | null) => void;
  isFrequentlyUsed?: boolean;
  isEditMode?: boolean;
}

const MedicoToolCardComponent: React.FC<MedicoToolCardProps> = ({ tool, onLaunch, isFrequentlyUsed, isEditMode }) => {
  const cardContent = (
    <motion.div
      whileHover={!isEditMode ? { y: -5, boxShadow: "0px 10px 20px hsla(var(--primary) / 0.1)" } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={cn(
        "bg-card rounded-xl overflow-hidden shadow-md transition-all duration-300 h-full flex flex-col group relative border-2 border-transparent",
        !isEditMode && "hover:shadow-xl cursor-pointer",
        isFrequentlyUsed && !isEditMode && "tool-card-frequent firebase-gradient-border-hover animate-subtle-pulse-glow",
        tool.comingSoon && "opacity-60 hover:shadow-md cursor-not-allowed",
        isEditMode && "cursor-grab border-dashed border-muted-foreground/50"
      )}
      role="button"
      tabIndex={tool.comingSoon || isEditMode ? -1 : 0}
      aria-disabled={!!(tool.comingSoon || isEditMode)}
      aria-label={`Launch ${tool.title}`}
    >
      {isEditMode && (
        <GripVertical className="absolute top-2 right-2 h-5 w-5 text-muted-foreground z-10" title="Drag to reorder" />
      )}
      {isFrequentlyUsed && !isEditMode && (
        <Star className="absolute top-2 right-2 h-5 w-5 text-yellow-400 fill-yellow-400 z-10" />
      )}
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center gap-3 mb-1.5">
          <div className={cn(
              "p-2 rounded-lg bg-primary/10 text-primary transition-colors duration-300",
              !isEditMode && "group-hover:bg-primary/20"
          )}>
              <tool.icon className={cn(
                  "h-7 w-7 transition-transform duration-300",
                  !isEditMode && "group-hover:scale-110 text-primary"
              )} />
          </div>
          <CardTitle className={cn(
              "text-lg leading-tight text-foreground",
               !isEditMode && "group-hover:text-primary"
          )}>{tool.title}</CardTitle>
        </div>
        <CardDescription className="text-xs leading-relaxed line-clamp-2 min-h-[2.5em]">{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2 px-4 pb-3 flex-grow flex items-end">
        {tool.comingSoon ? (
          <div className="text-center text-xs text-amber-700 dark:text-amber-500 font-semibold p-1.5 bg-amber-500/10 rounded-md w-full">
            Coming Soon!
          </div>
        ) : (
           <div className="w-full text-right">
              <Button variant="link" size="sm" disabled={isEditMode} className={cn(
                  "text-primary group-hover:underline p-0 h-auto text-xs",
                   !isEditMode && "group-hover:text-foreground group-hover:hover:text-primary",
                   isEditMode && "text-muted-foreground cursor-default"
                  )}>
                 Open Tool <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
           </div>
        )}
      </CardContent>
    </motion.div>
  );

  // If the tool has a direct href, it's a link to a separate page.
  if (tool.href) {
    return <Link href={tool.href} className="no-underline h-full flex">{cardContent}</Link>;
  }

  // If it's not a link and has a component, it should open in the dialog via the dashboard.
  return (
    <DialogTrigger asChild onClick={(e) => {
        if (isEditMode || tool.comingSoon) {
            e.preventDefault(); // Prevent dialog from opening in edit mode or if coming soon.
        } else {
            onLaunch(tool.id);
        }
    }}>
      {cardContent}
    </DialogTrigger>
  );
};

export const MedicoToolCard = React.memo(MedicoToolCardComponent);
MedicoToolCard.displayName = 'MedicoToolCard';
