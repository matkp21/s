// src/components/medico/NeuralProgress.tsx
"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  label: string;
  value: number;
  colorClass: string;
}

function ProgressBar({ label, value, colorClass }: ProgressBarProps) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-foreground/90">{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", colorClass)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function NeuralProgress() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-card to-secondary/20 dark:from-slate-900/80 dark:to-slate-800/60 p-4 shadow-lg border border-border/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Study Progress</h2>
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl px-3 py-1 text-sm font-bold text-white flex items-center gap-1 shadow-md">
          <Flame className="h-4 w-4" /> 127 Day Streak
        </div>
      </div>
      <ProgressBar label="Anatomy" value={85} colorClass="bg-gradient-to-r from-cyan-400 to-blue-500" />
      <ProgressBar label="Physiology" value={72} colorClass="bg-gradient-to-r from-green-400 to-teal-500" />
      <ProgressBar label="Pathology" value={91} colorClass="bg-gradient-to-r from-yellow-400 to-orange-500" />
    </div>
  );
}
