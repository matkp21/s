// src/components/common/tool-card.tsx
import React, { Suspense } from 'react';
import type { ProTool } from '@/components/pro/pro-dashboard'; // Assuming ProTool might be more generic
import type { MedicoTool } from '@/types/medico-tools';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight, Star, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// A more generic type to accommodate both Pro and Medico tools
interface GenericTool {
  id: string | null;
  title: string;
  description: string;
  icon: React.ElementType;
  component?: React.LazyExoticComponent<React.ComponentType<any>>;
  href?: string;
  comingSoon?: boolean;
  isFrequentlyUsed?: boolean;
}

interface ToolCardProps {
  tool: GenericTool;
  isFrequentlyUsed?: boolean;
  isEditMode?: boolean;
}

const ToolCardComponent: React.FC<ToolCardProps> = ({ tool, isFrequentlyUsed, isEditMode }) => {
  const cardContent = (
    <motion.div
      whileHover={!isEditMode ? { y: -5, boxShadow: "0px 10px 20px hsla(var(--primary) / 0.2)" } : {}}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "bg-card rounded-xl overflow-hidden shadow-md transition-all duration-300 h-full flex flex-col group relative border-2 border-transparent",
        !isEditMode && isFrequentlyUsed && "tool-card-frequent firebase-gradient-border-hover animate-subtle-pulse-glow",
        !isEditMode && !isFrequentlyUsed && "hover:shadow-lg hover:border-primary/40",
        tool.comingSoon && "opacity-60 hover:shadow-md cursor-not-allowed",
        isEditMode && "cursor-grab border-dashed border-muted-foreground/50"
      )}
      role="button"
      tabIndex={isEditMode || tool.comingSoon ? -1 : 0}
      aria-disabled={!!(isEditMode || tool.comingSoon)}
      aria-label={`Launch ${tool.title}`}
    >
      {isEditMode && (
        <GripVertical className="absolute top-2 left-2 h-5 w-5 text-muted-foreground z-10" title="Drag to reorder" />
      )}
      {isFrequentlyUsed && !isEditMode && (
        <Star className="absolute top-2 right-2 h-5 w-5 text-yellow-400 fill-yellow-400 z-10" />
      )}
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center gap-3 mb-1.5">
          <div className={cn(
            "p-2 rounded-lg bg-primary/10 text-primary transition-colors duration-300",
            !isEditMode && "group-hover:bg-gradient-to-br group-hover:from-[hsl(var(--firebase-color-1-light-h),var(--firebase-color-1-light-s),calc(var(--firebase-color-1-light-l)_-_10%))/0.2] group-hover:to-[hsl(var(--firebase-color-3-light-h),var(--firebase-color-3-light-s),calc(var(--firebase-color-3-light-l)_-_10%))/0.2] group-hover:text-foreground"
          )}>
            <tool.icon className={cn(
              "h-7 w-7 transition-transform duration-300",
              !isEditMode && "group-hover:scale-110",
              !isEditMode && "group-hover:text-purple-500"
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
        <div className="w-full text-right">
          {tool.comingSoon ? (
            <div className="text-center text-xs text-amber-700 dark:text-amber-500 font-semibold p-1.5 bg-amber-500/10 rounded-md w-full">Coming Soon!</div>
          ) : (
            <div className={cn(
              "text-primary group-hover:underline p-0 h-auto text-xs font-semibold flex items-center justify-end",
              !isEditMode && "group-hover:text-foreground group-hover:hover:text-primary",
              isEditMode && "text-muted-foreground cursor-default"
            )}>
              Open Tool <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          )}
        </div>
      </CardContent>
    </motion.div>
  );

  // If the tool has an href, it navigates to a new page.
  if (tool.href && !isEditMode && !tool.comingSoon) {
    return (
      <Link href={tool.href} className="no-underline h-full flex" aria-label={`Launch ${tool.title}`}>
        {cardContent}
      </Link>
    );
  }
  
  // If the tool has a component, it opens in a dialog via URL param.
  if (tool.component && tool.id && !isEditMode && !tool.comingSoon) {
    return (
      <Link href={`?tool=${tool.id}`} scroll={false} className="no-underline h-full flex" aria-label={`Launch ${tool.title}`}>
        {cardContent}
      </Link>
    );
  }

  // Fallback for tools with no action defined yet or in edit mode.
  return cardContent;
};

export const ToolCard = React.memo(ToolCardComponent);
ToolCard.displayName = 'ToolCard';
