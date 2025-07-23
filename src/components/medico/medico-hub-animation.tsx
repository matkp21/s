
// src/components/medico/medico-hub-animation.tsx
"use client";

import type { CSSProperties } from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, BrainCircuit, FlaskConical } from 'lucide-react';

interface MedicoHubAnimationProps {
  onAnimationComplete: () => void;
}

export function MedicoHubAnimation({ onAnimationComplete }: MedicoHubAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 3800); // Animation duration

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.5, delay: 3.3 } 
    }
  };

  const iconVariants = (delay: number) => ({
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: delay, duration: 0.7, type: "spring", stiffness: 120 }
    },
  });

  const textVariants = (delay: number) => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: delay, duration: 0.8, ease: "easeOut" }
    },
  });

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white overflow-hidden p-4 medico-hub-animation"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit" 
    >
      <div className="relative flex items-center justify-center mb-8 w-48 h-48">
        <motion.div variants={iconVariants(0.4)} className="absolute transform -translate-x-12 -translate-y-6">
          <BookOpen className="h-16 w-16 text-blue-300 opacity-80" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)/0.5))' } as CSSProperties} />
        </motion.div>
        <motion.div variants={iconVariants(0.6)} className="absolute transform translate-x-12 -translate-y-6">
          <FlaskConical className="h-16 w-16 text-teal-300 opacity-80" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--accent)/0.5))' } as CSSProperties} />
        </motion.div>
        <motion.div variants={iconVariants(0.8)} className="absolute transform translate-y-10">
          <BrainCircuit className="h-20 w-20 text-indigo-300 opacity-90" style={{ filter: 'drop-shadow(0 0 12px hsl(260, 80%, 70%, 0.6))' } as CSSProperties} />
        </motion.div>
      </div>
      
      <motion.h1 
        className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-400 to-sky-300"
        variants={textVariants(1.2)}
      >
        Medico Study Hub
      </motion.h1>
      
      <motion.p 
        className="text-md sm:text-lg text-slate-300/90 text-center"
        variants={textVariants(1.5)}
      >
        Your AI-powered study partner is preparing your dashboard.
      </motion.p>
    </motion.div>
  );
}
