// src/types/medico-tools.ts
import type { ReactNode } from 'react';

export type ActiveToolId =
  | 'guided-study' // New orchestrator tool
  | 'q-bank'
  | 'theorycoach-generator'
  | 'topics'
  | 'flowcharts'
  | 'flashcards'
  | 'mnemonics'
  | 'timetable'
  | 'mcq'
  | 'cases'
  | 'ddx'
  | 'anatomy'
  | 'rounds'
  | 'dosage'
  | 'progress'
  | 'summarizer' 
  | 'videos'
  | 'dictation'
  | 'challenges'
  | 'exams'
  | 'library'
  | 'pathomind'
  | 'pharmagenie'
  | 'micromate'
  | 'diagnobot'
  | null;

export interface MedicoTool {
  id: ActiveToolId;
  title: string;
  description: string;
  icon: React.ElementType;
  component?: React.ElementType; 
  href?: string; 
  comingSoon?: boolean;
  isFrequentlyUsed?: boolean; // Added for dashboard layout
}
