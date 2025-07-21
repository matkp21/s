// src/types/medico-tools.ts
import type { ReactNode } from 'react';

export type ActiveToolId =
  | 'guided-study' // New orchestrator tool
  | 'q-bank'
  | 'notes-generator' // Corrected ID
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
  | 'smart-search'
  | 'comprehensive-review' // New tool ID
  | null;

export interface MedicoTool {
  id: ActiveToolId;
  title: string;
  description: string;
  icon: React.ElementType;
  component?: React.ComponentType<{ initialTopic?: string | null }>; // Accept initialTopic prop
  href?: string; 
  comingSoon?: boolean;
  isFrequentlyUsed?: boolean; // Added for dashboard layout
}
