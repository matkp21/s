"use client";

import type { CSSProperties } from 'react';
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeartPulse, BookHeart, BriefcaseMedical, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProMode } from '@/contexts/pro-mode-context';
import { HeroWidgets, type HeroTask } from './hero-widgets';

const greetings = [
  { lang: "en", text: "Hello," },
  { lang: "hi", text: "नमस्ते," },
  { lang: "ml", text: "നമസ്കാരം," },
  { lang: "es", text: "Hola," },
  { lang: "fr", text: "Bonjour," },
];

const sampleTasks: HeroTask[] = [
    { id: '1', date: new Date(), title: 'Follow up with Mr. Smith', description: 'Check lab results and adjust medication.' },
    { id: '2', date: new Date(), title: 'Prepare for ward rounds', description: 'Review cases for Ward 5B.' },
    { id: '3', date: new Date(new Date().setDate(new Date().getDate() + 1)), title: 'Cardiology Clinic', description: 'Afternoon clinic session.' },
];

export function HeroSection() {
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
  const { userRole } = useProMode();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      setCurrentGreetingIndex((prevIndex) => (prevIndex + 1) % greetings.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  let ctaLink = "/chat";
  let ctaText = "Get Started";
  let CtaIcon = HeartPulse;

  if (userRole === 'medico') {
    ctaLink = "/medico";
    ctaText = "Medico Study Hub";
    CtaIcon = BookHeart;
  } else if (userRole === 'pro') {
    ctaLink = "/pro";
    ctaText = "Pro Clinical Suite";
    CtaIcon = BriefcaseMedical;
  }

  return (
    <section className="relative bg-background py-16 md:py-20 overflow-hidden border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      {isClient && (
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-center mb-6">
          <AnimatePresence mode="wait">
            <motion.span
              key={greetings[currentGreetingIndex].text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              lang={greetings[currentGreetingIndex].lang}
              className="inline-block firebase-gradient-text"
            >
              {greetings[currentGreetingIndex].text}
            </motion.span>
          </AnimatePresence>
         </h1>
        )}

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground/90 mb-4 flex items-center justify-center"
        >
          Welcome to&nbsp;
          <span className="animated-gradient-text">MediAssistant</span>
          <Sparkles className="ml-2 h-6 w-6 text-accent animate-pulse-medical" />
          .
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-md sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-8"
        >
          Your intelligent partner for AI-powered diagnostics, imaging analysis, and educational support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mb-10"
        >
          <Button
            asChild
            size="lg"
            className="rounded-lg group px-8 py-6 text-lg shadow-lg"
          >
            <Link href={ctaLink} className="flex items-center">
              {ctaText}
              <CtaIcon className="ml-2 h-6 w-6 group-hover:scale-110" />
            </Link>
          </Button>
        </motion.div>
        
        <HeroWidgets tasks={sampleTasks} />
      </div>
    </section>
  );
}