
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Stethoscope, ScanSearch, BookOpenText, LayoutDashboard } from "lucide-react";

export type ActiveMode = 'symptom' | 'image' | 'education' | 'dashboard';

interface ModeSwitcherProps {
  activeMode: ActiveMode;
  setActiveMode: (mode: ActiveMode) => void;
}

export function ModeSwitcher({ activeMode, setActiveMode }: ModeSwitcherProps) {
  const modes = [
    { id: 'symptom' as const, label: 'Symptoms', icon: Stethoscope },
    { id: 'image' as const, label: 'Imaging', icon: ScanSearch },
    { id: 'education' as const, label: 'Education', icon: BookOpenText },
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="flex space-x-1 bg-muted p-1 rounded-xl shadow-md">
        {modes.map((mode) => (
          <Button
            key={mode.id}
            variant="ghost"
            onClick={() => setActiveMode(mode.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
              activeMode === mode.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/70 hover:bg-background/50"
            )}
          >
            <mode.icon className="mr-2 h-4 w-4" />
            {mode.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
