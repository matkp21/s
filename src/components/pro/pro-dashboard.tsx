// src/components/pro/pro-dashboard.tsx
"use client";

import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { cn } from '@/lib/utils';
import {
  Brain, ClipboardCheck, ArrowRightLeft, Mic, BarChart3, BriefcaseMedical,
  FileText, Pill, MessageSquareHeart, PhoneForwarded, Library, FilePlus, Settings, Star, CheckSquare, ShieldCheck
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

// Import the actual components
import { DifferentialDiagnosisAssistant } from './differential-diagnosis-assistant';
import { DischargeSummaryGenerator } from './discharge-summary-generator';
import { TreatmentProtocolNavigator } from './treatment-protocol-navigator';
import { PharmacopeiaChecker } from './pharmacopeia-checker';
import { SmartDictation } from './smart-dictation';
import { ClinicalCalculatorSuite } from './clinical-calculator-suite';
import { PatientCommunicationDrafter } from './patient-communication-drafter';
import { OnCallHandoverAssistant } from './on-call-handover-assistant';
import { ResearchSummarizer } from './research-summarizer';
import { TriageAndReferral } from './triage-and-referral';
import { ProToolCard } from './pro-tool-card'; // Import the extracted component

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
  | 'smartTriage' // New tool ID for the coordinator
  | null;

interface ProTool {
  id: ActiveToolId;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ElementType;
}

const allProToolsList: ProTool[] = [
  { id: 'smartTriage', title: 'Smart Triage & Referral', description: 'AI coordinator analyzes symptoms and drafts a referral if needed.', icon: ShieldCheck, component: TriageAndReferral },
  { id: 'diffDx', title: 'Differential Diagnosis Assistant', description: 'AI-powered suggestions, investigations, and initial management steps.', icon: Brain, component: DifferentialDiagnosisAssistant },
  { id: 'discharge', title: 'Discharge Summary Generator', description: 'Ultra-streamlined, predictive discharge summary creation.', icon: FilePlus, component: DischargeSummaryGenerator },
  { id: 'protocols', title: 'Treatment Protocol Navigator', description: 'Access latest evidence-based treatment guidelines.', icon: ClipboardCheck, component: TreatmentProtocolNavigator },
  { id: 'pharmacopeia', title: 'Pharmacopeia & Interaction Checker', description: 'Comprehensive drug database and interaction analysis.', icon: Pill, component: PharmacopeiaChecker },
  { id: 'dictation', title: 'Smart Dictation & Note Assistant', description: 'Advanced voice-to-text with medical terminology and structuring.', icon: Mic, component: SmartDictation },
  { id: 'calculators', title: 'Intelligent Clinical Calculators', description: 'Suite of scores and criteria (GRACE, Wells\', etc.).', icon: BarChart3, component: ClinicalCalculatorSuite },
  { id: 'patientComm', title: 'Patient Communication Drafter', description: 'AI drafts for patient-friendly explanations and instructions.', icon: MessageSquareHeart, component: PatientCommunicationDrafter },
  { id: 'onCallHandover', title: 'On-Call Handover Assistant', description: 'Structured handovers with "if-then" scenarios and escalation.', icon: ArrowRightLeft, component: OnCallHandoverAssistant },
  { id: 'research', title: 'Research & Literature Summarizer', description: 'AI summaries of key papers for clinical questions.', icon: Library, component: ResearchSummarizer },
];

const frequentlyUsedToolIds: ActiveToolId[] = ['smartTriage', 'discharge', 'pharmacopeia', 'protocols'];


export function ProModeDashboard() {
  const [activeDialog, setActiveDialog] = useState<ActiveToolId>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [displayedTools, setDisplayedTools] = useState<ProTool[]>(allProToolsList);

  const currentTool = allProToolsList.find(tool => tool.id === activeDialog);

  const frequentlyUsedTools = displayedTools.filter(tool => frequentlyUsedToolIds.includes(tool.id));
  const otherTools = displayedTools.filter(tool => !frequentlyUsedToolIds.includes(tool.id));

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1 firebase-gradient-text">Clinical Suite Dashboard</h1>
            <p className="text-md text-muted-foreground">
            Your personalized command center for advanced AI clinical tools.
            </p>
        </div>
        <Button variant="outline" onClick={() => setIsEditMode(!isEditMode)} size="sm" className="rounded-lg group">
          {isEditMode ? <CheckSquare className="mr-2 h-4 w-4"/> : <Settings className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-45"/>}
          {isEditMode ? 'Save Layout' : 'Customize'}
        </Button>
      </div>

      {isEditMode ? (
        <>
           <div className="p-4 mb-6 border border-dashed border-primary/50 rounded-lg bg-primary/5 text-center">
              <p className="text-sm text-primary">
                  Customize Dashboard: Drag and drop the tool cards below to reorder your dashboard.
              </p>
          </div>
          <Reorder.Group
            as="div"
            values={displayedTools}
            onReorder={setDisplayedTools}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {displayedTools.map((tool) => (
              <Reorder.Item key={tool.id} value={tool} layout>
                <Dialog open={activeDialog === tool.id} onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}>
                  <ProToolCard
                    tool={tool}
                    onLaunch={setActiveDialog}
                    isFrequentlyUsed={frequentlyUsedToolIds.includes(tool.id)}
                    isEditMode={isEditMode}
                  />
                  {tool.component && activeDialog === tool.id && (
                    <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] flex flex-col p-0">
                      <DialogHeader className="p-6 pb-4 sticky top-0 bg-background border-b z-10">
                        <DialogTitle className="text-2xl flex items-center gap-2">
                          <tool.icon className="h-6 w-6 text-primary" /> {tool.title}
                        </DialogTitle>
                        <DialogDescription className="text-sm">{tool.description}</DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="flex-grow overflow-y-auto">
                        <div className="p-6 pt-2">
                          <tool.component />
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  )}
                </Dialog>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </>
      ) : (
        <>
          {frequentlyUsedTools.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                <Star className="mr-2 h-6 w-6 text-yellow-400 fill-yellow-400"/> Frequently Used
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {frequentlyUsedTools.map((tool) => (
                  <Dialog key={`${tool.id}-freq`} open={activeDialog === tool.id} onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}>
                    <ProToolCard tool={tool} onLaunch={setActiveDialog} isFrequentlyUsed isEditMode={isEditMode} />
                    {tool.component && activeDialog === tool.id && (
                        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] flex flex-col p-0">
                            <DialogHeader className="p-6 pb-4 sticky top-0 bg-background border-b z-10">
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <tool.icon className="h-6 w-6 text-primary" /> {tool.title}
                            </DialogTitle>
                            <DialogDescription className="text-sm">{tool.description}</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="flex-grow overflow-y-auto">
                            <div className="p-6 pt-2">
                                <tool.component />
                            </div>
                            </ScrollArea>
                        </DialogContent>
                    )}
                  </Dialog>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-5">All Professional Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {otherTools.map((tool) => (
                <Dialog key={tool.id} open={activeDialog === tool.id} onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}>
                    <ProToolCard tool={tool} onLaunch={setActiveDialog} isEditMode={isEditMode} />
                    {tool.component && activeDialog === tool.id && (
                         <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] flex flex-col p-0">
                            <DialogHeader className="p-6 pb-4 sticky top-0 bg-background border-b z-10">
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <tool.icon className="h-6 w-6 text-primary" /> {tool.title}
                            </DialogTitle>
                            <DialogDescription className="text-sm">{tool.description}</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="flex-grow overflow-y-auto">
                            <div className="p-6 pt-2">
                                <tool.component />
                            </div>
                            </ScrollArea>
                        </DialogContent>
                    )}
                </Dialog>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
