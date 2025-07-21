
// src/components/medico/next-steps-display.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowRight, ChevronDown, Save } from 'lucide-react';

interface NextStep {
  title: string;
  description: string;
  toolId: string;
  prefilledTopic: string;
  cta: string;
}

interface NextStepsDisplayProps {
  nextSteps: NextStep[] | undefined;
  onSaveToLibrary: () => void;
  isUserLoggedIn: boolean;
}

export const NextStepsDisplay: React.FC<NextStepsDisplayProps> = ({ nextSteps, onSaveToLibrary, isUserLoggedIn }) => {
  if (!nextSteps || nextSteps.length === 0) {
    return (
      <div className="flex justify-start w-full">
        <Button onClick={onSaveToLibrary} disabled={!isUserLoggedIn}>
          <Save className="mr-2 h-4 w-4"/> Save to Library
        </Button>
      </div>
    );
  }

  const primaryAction = nextSteps[0];
  const secondaryActions = nextSteps.slice(1);

  return (
    <div className="flex items-center justify-between w-full flex-wrap gap-2">
      <Button onClick={onSaveToLibrary} disabled={!isUserLoggedIn}>
        <Save className="mr-2 h-4 w-4"/> Save to Library
      </Button>
      <div className="flex rounded-md border">
        <Button asChild className="flex-grow rounded-r-none border-r-0 font-semibold">
          <Link href={`/medico/${primaryAction.toolId}?topic=${encodeURIComponent(primaryAction.prefilledTopic)}`}>
            {primaryAction.cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        {secondaryActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-l-none">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>More Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {secondaryActions.map((step, index) => (
                <DropdownMenuItem key={index} asChild className="cursor-pointer">
                  <Link href={`/medico/${step.toolId}?topic=${encodeURIComponent(step.prefilledTopic)}`}>
                    {step.cta}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
