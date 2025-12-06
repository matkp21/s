// src/components/pro/pro-tool-card.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';

// Define types locally for this component to be self-contained
type ActiveToolId =
  | 'diffDx'
  | 'protocols'
  | 'pharmacopeia'
  | 'dictation'
  | 'calculators'
  | 'patientComm'
  | 'onCallHandover'
  | 'research'
  | 'discharge'
  | 'smartTriage'
  | null;

interface ProTool {
  id: ActiveToolId;
  title: string;
  description: string;
  icon: React.ElementType;
  component?: React.ElementType;
  href?: string;
  isFrequentlyUsed?: boolean;
}

interface ToolCardProps {
  tool: ProTool;
  onLaunch: (toolId: ActiveToolId) => void;
  isFrequentlyUsed?: boolean;
}

const ToolCardComponent: React.FC<ToolCardProps> = ({ tool, onLaunch, isFrequentlyUsed }) => {
  const cardContent = (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0px 10px 20px hsla(var(--primary) / 0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "bg-card rounded-xl overflow-hidden shadow-md transition-all duration-300 h-full flex flex-col group relative border-2 border-transparent",
        "hover:shadow-lg cursor-pointer",
        isFrequentlyUsed && "tool-card-frequent firebase-gradient-border-hover animate-subtle-pulse-glow"
      )}
      role="button"
      tabIndex={0}
      aria-label={`Launch ${tool.title}`}
    >
      {isFrequentlyUsed && (
        <Star className="absolute top-2 right-2 h-5 w-5 text-yellow-400 fill-yellow-400 z-10" />
      )}
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20">
            <tool.icon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110 text-primary" />
          </div>
          <CardTitle className="text-lg leading-tight text-foreground group-hover:text-primary">{tool.title}</CardTitle>
        </div>
        <CardDescription className="text-xs leading-relaxed line-clamp-2 min-h-[2.5em]">{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2 px-4 pb-3 flex-grow flex items-end">
        <div className="w-full text-right">
            <span className="text-primary group-hover:underline p-0 h-auto text-xs font-semibold flex items-center justify-end group-hover:text-foreground group-hover:hover:text-primary">
             Open Tool <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
        </div>
      </CardContent>
    </motion.div>
  );

  const handleAction = (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
    if (tool.id && tool.component) {
      e.preventDefault();
      onLaunch(tool.id);
    }
  };
  
  if (tool.href) {
    return <Link href={tool.href} className="no-underline h-full flex">{cardContent}</Link>;
  }

  return (
    <DialogTrigger asChild onClick={handleAction} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleAction(e)}>
      {cardContent}
    </DialogTrigger>
  );
};

export const ProToolCard = React.memo(ToolCardComponent);
ProToolCard.displayName = 'ProToolCard';
