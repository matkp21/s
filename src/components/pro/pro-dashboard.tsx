// src/components/pro/pro-dashboard.tsx
"use client";

import type { ReactNode } from 'react';
import React, { useState, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain, ClipboardCheck, ArrowRightLeft, Mic, BarChart3, BriefcaseMedical,
  FileText, Pill, MessageSquareHeart, PhoneForwarded, Library, FilePlus, Settings, Star, CheckSquare, ShieldCheck
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { DifferentialDiagnosisAssistant } from './differential-diagnosis-assistant';
import { DischargeSummaryGenerator } from './discharge-summary-generator';
import { TreatmentProtocolNavigator } from './treatment-protocol-navigator';
import { PharmacopeiaChecker } from './pharmacopeia-checker';
import { SmartDictation } from '../medico/smart-dictation';
import { ClinicalCalculatorSuite } from './clinical-calculator-suite';
import { PatientCommunicationDrafter } from './patient-communication-drafter';
import { OnCallHandoverAssistant } from './on-call-handover-assistant';
import { ResearchSummarizer } from './research-summarizer';
import { TriageAndReferral } from './triage-and-referral';
import { ProToolCard } from './pro-tool-card';
import { Loader2 } from 'lucide-react';
import { PersonalizedClinicalDashboard } from './personalized-clinical-dashboard';
import { Button } from '../ui/button';

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

export interface ProTool {
  id: ActiveToolId;
  title: string;
  description: string;
  icon: React.ElementType;
  component?: React.ComponentType<{}>;
  href?: string;
  isFrequentlyUsed?: boolean;
}

const allProToolsList: ProTool[] = [
  { id: 'smartTriage', title: 'Smart Triage & Referral', description: 'AI coordinator analyzes symptoms and drafts a referral if needed.', icon: ShieldCheck, component: TriageAndReferral, isFrequentlyUsed: true },
  { id: 'diffDx', title: 'Differential Diagnosis Assistant', description: 'AI-powered suggestions, investigations, and initial management steps.', icon: Brain, component: DifferentialDiagnosisAssistant, isFrequentlyUsed: true },
  { id: 'discharge', title: 'Discharge Summary Generator', description: 'Ultra-streamlined, predictive discharge summary creation.', icon: FilePlus, component: DischargeSummaryGenerator, isFrequentlyUsed: true },
  { id: 'protocols', title: 'Treatment Protocol Navigator', description: 'Access latest evidence-based treatment guidelines.', icon: ClipboardCheck, component: TreatmentProtocolNavigator, isFrequentlyUsed: true },
  { id: 'pharmacopeia', title: 'Pharmacopeia & Interaction Checker', description: 'Comprehensive drug database and interaction analysis.', icon: Pill, component: PharmacopeiaChecker },
  { id: 'dictation', title: 'Smart Dictation & Note Assistant', description: 'Advanced voice-to-text with medical terminology and structuring.', icon: Mic, component: SmartDictation },
  { id: 'calculators', title: 'Intelligent Clinical Calculators', description: 'Suite of scores and criteria (GRACE, Wells\', etc.).', icon: BarChart3, component: ClinicalCalculatorSuite },
  { id: 'patientComm', title: 'Patient Communication Drafter', description: 'AI drafts for patient-friendly explanations and instructions.', icon: MessageSquareHeart, component: PatientCommunicationDrafter },
  { id: 'onCallHandover', title: 'On-Call Handover Assistant', description: 'Structured handovers with "if-then" scenarios and escalation.', icon: ArrowRightLeft, component: OnCallHandoverAssistant },
  { id: 'research', title: 'Research & Literature Summarizer', description: 'AI summaries of key papers for clinical questions.', icon: Library, component: ResearchSummarizer },
  { id: 'patient-management', title: 'Patient Management Suite', description: 'Log round notes, track tasks, and view patient timelines.', icon: BriefcaseMedical, href: '/patient-management' },
];

export function ProModeDashboard() {
  const [activeDialog, setActiveDialog] = useState<ActiveToolId>(null);
  
  const currentTool = allProToolsList.find(tool => tool.id === activeDialog);
  const ToolComponent = currentTool?.component;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-10">
        <PersonalizedClinicalDashboard />
      </div>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-5">All Professional Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {allProToolsList.map((tool) => (
            <ProToolCard 
              key={tool.id} 
              tool={tool} 
              onLaunch={setActiveDialog} 
              isFrequentlyUsed={tool.isFrequentlyUsed}
            />
          ))}
        </div>
      </section>

      <Dialog open={!!activeDialog} onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}>
        {currentTool && ToolComponent && (
            <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 sticky top-0 bg-background border-b z-10">
                <DialogTitle className="text-2xl flex items-center gap-2">
                    <currentTool.icon className="h-6 w-6 text-primary" /> {currentTool.title}
                </DialogTitle>
                <DialogDescription className="text-sm">{currentTool.description}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-grow overflow-y-auto">
                <div className="p-6 pt-2">
                    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
                        <ToolComponent />
                    </Suspense>
                </div>
                </ScrollArea>
            </DialogContent>
        )}
      </Dialog>

    </div>
  );
}
