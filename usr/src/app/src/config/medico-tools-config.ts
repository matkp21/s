// src/config/medico-tools-config.ts
import type { MedicoTool, ActiveToolId } from '@/types/medico-tools';
import {
  NotebookText, FileQuestion, CalendarClock, Layers, CaseUpper, Lightbulb, BookCopy,
  Users, Eye, Brain, TrendingUp, Calculator, Workflow, Award, Star, Settings, CheckSquare, GripVertical, FileText, Youtube, Mic, FlaskConical, Microscope, TestTubeDiagonal, Swords, Library, Trophy, PackageCheck, Search, BrainCircuit
} from 'lucide-react';

// Component Imports
import { StudyNotesGenerator } from '@/components/medico/study-notes-generator';
import { McqGenerator } from '@/components/medico/mcq-generator';
import { StudyTimetableCreator } from '@/components/medico/study-timetable-creator';
import { FlashcardGenerator } from '@/components/medico/flashcard-generator';
import { SolvedQuestionPapersViewer } from '@/components/medico/solved-question-papers-viewer';
import { MnemonicsGenerator } from '@/components/medico/mnemonics-generator';
import { FlowchartCreator } from '@/components/medico/flowchart-creator';
import { ClinicalCaseSimulator } from '@/components/medico/clinical-case-simulator';
import { DifferentialDiagnosisTrainer } from '@/components/medico/differential-diagnosis-trainer';
import { PathoMindExplainer } from '@/components/medico/pathomind-explainer';
import { PharmaGenie } from '@/components/medico/pharma-genie';
import { MicroMate } from '@/components/medico/micro-mate';
import { DiagnoBot } from '@/components/medico/diagno-bot';
import { HighYieldTopicPredictor } from '@/components/medico/high-yield-topic-predictor';
import { AnatomyVisualizer } from '@/components/medico/anatomy-visualizer';
import { DrugDosageCalculator } from '@/components/medico/drug-dosage-calculator';
import { NoteSummarizer } from '@/components/medico/note-summarizer';
import { VirtualPatientRounds } from '@/components/medico/virtual-patient-rounds';
import { ProgressTracker } from '@/components/medico/progress-tracker';
import { SmartDictation } from '@/components/medico/smart-dictation';
import { GamifiedCaseChallenges } from '@/components/medico/gamified-case-challenges';
import { MockExamSuite } from '@/components/medico/mock-exam-suite';
import { GuidedStudyFlow } from '@/components/medico/guided-study-flow';
import SmartSearch from '@/components/medico/smart-search';
import { ComprehensiveTopicReview } from '@/components/medico/comprehensive-topic-review';
import { MedicoAdvancedNotes } from '@/components/medico/medico-advanced-notes';


// Define the full list of tools
export const allMedicoToolsList: MedicoTool[] = [
  { id: 'guided-study', title: 'Guided Study Session', description: 'AI orchestrates a full study session (notes, MCQs, flashcards) from one topic.', icon: PackageCheck, component: GuidedStudyFlow, isFrequentlyUsed: true },
  { id: 'notes-generator', title: 'Study Notes Generator', description: 'Generate structured notes for medical topics in a university exam format.', icon: NotebookText, component: StudyNotesGenerator, isFrequentlyUsed: true },
  { id: 'advanced-notes', title: 'Advanced Notes (MedGemma)', description: 'Generate multi-modal study notes using a specialized medical AI and image generation.', icon: BrainCircuit, component: MedicoAdvancedNotes, isFrequentlyUsed: true },
  { id: 'mcq', title: 'MCQ Generator', description: 'Create multiple-choice questions for exam practice.', icon: FileQuestion, component: McqGenerator, isFrequentlyUsed: true },
  { id: 'flashcards', title: 'Flashcard Generator', description: 'Create digital flashcards for quick revision.', icon: Layers, component: FlashcardGenerator, isFrequentlyUsed: true },
  { id: 'challenges', title: 'Gamified Case Challenges', description: 'Solve timed diagnostic challenges and compete on leaderboards.', icon: Swords, component: GamifiedCaseChallenges, isFrequentlyUsed: true },
  { id: 'comprehensive-review', title: 'Comprehensive Topic Review', description: 'Generate notes, MCQs, and a flowchart for a topic all at once.', icon: BookCopy, component: ComprehensiveTopicReview, isFrequentlyUsed: false },
  { id: 'smart-search', title: 'Smart Search (RAG)', description: 'Ask questions and get grounded answers from your knowledge base.', icon: Search, component: SmartSearch, isFrequentlyUsed: false },
  { id: 'library', title: 'Knowledge Hub', description: 'Your personal library of notes, MCQs, and community content.', icon: Library, href: '/medico/library', isFrequentlyUsed: false },
  { id: 'q-bank', title: 'Exam Paper Generator', description: "Generate mock exam papers simulating previous years, with MCQs and essay questions.", icon: BookCopy, component: SolvedQuestionPapersViewer },
  { id: 'mnemonics', title: 'Mnemonic Generator', description: 'Create memory aids with AI-generated visuals.', icon: Lightbulb, component: MnemonicsGenerator },
  { id: 'pathomind', title: 'PathoMind', description: 'Explain any disease pathophysiology with diagrams.', icon: Brain, component: PathoMindExplainer },
  { id: 'pharmagenie', title: 'PharmaGenie', description: 'Drug classification, mechanisms, side effects.', icon: FlaskConical, component: PharmaGenie },
  { id: 'micromate', title: 'MicroMate', description: 'Bugs, virulence factors, lab diagnosis.', icon: Microscope, component: MicroMate },
  { id: 'diagnobot', title: 'DiagnoBot', description: 'Interpret labs, ECGs, X-rays, ABG, etc.', icon: TestTubeDiagonal, component: DiagnoBot },
  { id: 'exams', title: 'Mock Exam Suite', description: 'Take full-length mock exams with MCQs and essays.', icon: Trophy, component: MockExamSuite },
  { id: 'cases', title: 'Clinical Case Simulations', description: 'Practice with interactive patient scenarios.', icon: CaseUpper, component: ClinicalCaseSimulator },
  { id: 'ddx', title: 'Differential Diagnosis Trainer', description: 'List diagnoses based on symptoms with feedback.', icon: Brain, component: DifferentialDiagnosisTrainer },
  { id: 'anatomy', title: 'Interactive Anatomy Visualizer', description: 'Explore anatomical structures.', icon: Eye, component: AnatomyVisualizer },
  { id: 'dosage', title: 'Drug Dosage Calculator', description: 'Practice calculating drug doses.', icon: Calculator, component: DrugDosageCalculator },
  { id: 'flowcharts', title: 'Flowchart Creator', description: 'Generate flowcharts for medical topics to aid revision.', icon: Workflow, component: FlowchartCreator },
  { id: 'dictation', title: 'Smart Dictation', description: 'Use your voice to dictate notes, which AI can help structure.', icon: Mic, component: SmartDictation },
  { id: 'summarizer', title: 'Smart Note Summarizer', description: 'Upload notes (PDF/TXT) and get AI-powered summaries.', icon: FileText, component: NoteSummarizer },
  { id: 'timetable', title: 'Study Timetable Creator', description: 'Plan personalized study schedules.', icon: CalendarClock, component: StudyTimetableCreator },
  { id: 'topics', title: 'High-Yield Topic Predictor', description: 'Suggest priority topics for study based on exam trends or user performance.', icon: TrendingUp, component: HighYieldTopicPredictor },
  { id: 'rounds', title: 'Virtual Patient Rounds', description: 'Simulate ward rounds with patient cases.', icon: Users, component: VirtualPatientRounds },
  { id: 'progress', title: 'Progress Tracker', description: 'Track study progress with rewards (gamification).', icon: Award, component: ProgressTracker },
  { id: 'videos', title: 'Video Lecture Library', description: 'Search and find relevant medical video lectures.', icon: Youtube, href: '/medico/videos' },
];

export const frequentlyUsedMedicoToolIds: ActiveToolId[] = allMedicoToolsList
  .filter(t => t.isFrequentlyUsed)
  .map(t => t.id);
