// src/components/pro/pro-dashboard.tsx
"use client";

import type { ReactNode } from 'react';
import React, { useState, Suspense, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain, ClipboardCheck, ArrowRightLeft, Mic, BarChart3, BriefcaseMedical,
  FileText, Pill, MessageSquareHeart, PhoneForwarded, Library, FilePlus, Settings, Star, CheckSquare, ShieldCheck, Loader2
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
import { TriageAndReferral } from './triage-and-referral';
import { ProToolCard } from './pro-tool-card';
import { PersonalizedClinicalDashboard } from './personalized-clinical-dashboard';

export type ActiveToolId =
  | 'diffDx'
  | 'protocols'
  | 'pharmacopeia'
  | 'dictation'
  | 'calculators'
  | 'patientComm'
  | 'onCallHandover'
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
  { id: 'smartTriage', title: 'Smart Triage & Referral', description: 'AI coordinator analyzes symptoms and drafts a referral.', icon: ShieldCheck, component: TriageAndReferral, isFrequentlyUsed: true },
  { id: 'diffDx', title: 'Differential Diagnosis Assistant', description: 'AI-powered suggestions and investigations.', icon: Brain, component: DifferentialDiagnosisAssistant, isFrequentlyUsed: true },
  { id: 'discharge', title: 'Discharge Summary Generator', description: 'Predictive discharge summary creation.', icon: FilePlus, component: DischargeSummaryGenerator, isFrequentlyUsed: true },
  { id: 'protocols', title: 'Treatment Protocol Navigator', description: 'Evidence-based treatment guidelines.', icon: ClipboardCheck, component: TreatmentProtocolNavigator, isFrequentlyUsed: true },
  { id: 'pharmacopeia', title: 'Pharmacopeia & Interaction Checker', description: 'Drug database and interaction analysis.', icon: Pill, component: PharmacopeiaChecker },
  { id: 'dictation', title: 'Smart Dictation & Note Assistant', description: 'Voice-to-text with medical terminology.', icon: Mic, component: SmartDictation },
  { id: 'calculators', title: 'Intelligent Clinical Calculators', description: 'Suite of scores and criteria.', icon: BarChart3, component: ClinicalCalculatorSuite },
  { id: 'patientComm', title: 'Patient Communication Drafter', description: 'AI drafts for patient-friendly messages.', icon: MessageSquareHeart, component: PatientCommunicationDrafter },
  { id: 'onCallHandover', title: 'On-Call Handover Assistant', description: 'Structured handovers with escalation protocols.', icon: ArrowRightLeft, component: OnCallHandoverAssistant },
  { id: 'patient-management', title: 'Patient Management Suite', description: 'Log notes and view timelines.', icon: BriefcaseMedical, href: '/patient-management' },
];

export function ProModeDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeDialog, setActiveDialog] = useState<ActiveToolId>(null);
  
  useEffect(() => {
    const toolId = searchParams.get('tool') as ActiveToolId;
    if (toolId && allProToolsList.some(t => t.id === toolId)) {
        setActiveDialog(toolId);
    } else {
        setActiveDialog(null);
    }
  }, [searchParams]);

  const handleLaunchTool = (toolId: ActiveToolId) => {
    const params = new URLSearchParams(searchParams);
    if (toolId) params.set('tool', toolId);
    router.push(`/pro?${params.toString()}`, { scroll: false });
  }

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      const params = new URLSearchParams(searchParams);
      params.delete('tool');
      router.push(`/pro?${params.toString()}`, { scroll: false });
    }
  };

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
              onLaunch={handleLaunchTool} 
              isFrequentlyUsed={tool.isFrequentlyUsed}
            />
          ))}
        </div>
      </section>

      <Dialog open={!!activeDialog} onOpenChange={handleDialogChange}>
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
