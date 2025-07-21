// src/components/medico/NeuralProgress.tsx
"use client";

import { motion } from 'framer-motion';

export function NeuralProgress() {
  return (
    <div className="relative h-20 w-full overflow-hidden bg-muted/20 rounded-xl border border-border/30">
      <svg width="100%" height="100%" className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.circle
            key={`np-c-${i}`}
            cx={`${Math.random() * 100}%`}
            cy={`${Math.random() * 100}%`}
            r={Math.random() * 2 + 1}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 2 }}
            className="fill-primary/50"
          />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
           <motion.path
            key={`np-p-${i}`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0, 0.3, 0] }}
            transition={{ duration: Math.random() * 8 + 5, repeat: Infinity, delay: Math.random() * 4, ease: "easeInOut" }}
            d={`M ${Math.random() * 100}% ${Math.random() * 100}% C ${Math.random() * 100}% ${Math.random() * 100}%, ${Math.random() * 100}% ${Math.random() * 100}%, ${Math.random() * 100}% ${Math.random() * 100}%`}
            strokeWidth="0.5"
            className="stroke-accent/50 fill-none"
           />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-transparent via-background/80 to-transparent">
        <h3 className="text-xl font-semibold text-foreground/80 tracking-wide">
          Overall Progress: <span className="text-primary font-bold">78%</span>
        </h3>
      </div>
    </div>
  );
};
