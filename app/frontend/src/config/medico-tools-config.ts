// src/config/medico-tools-config.ts
import type { MedicoTool, ActiveToolId } from '@/types/medico-tools';
import {
  NotebookText, FileQuestion, CalendarClock, Layers, CaseUpper, Lightbulb, BookCopy,
  Users, Eye, Brain, TrendingUp, Calculator, Workflow, Award, Star, Settings, CheckSquare, GripVertical, FileText, Youtube, Mic, FlaskConical, Microscope, TestTubeDiagonal, Swords, Library, Trophy, PackageCheck, Search, BrainCircuit
} from 'lucide-react';

// Lazy load components
import { lazy } from 'react';
const StudyNotesGenerator = lazy(() => import('@/components/medico/study-notes-generator').then(module => ({ default: module.StudyNotesGenerator })));
const McqGenerator = lazy(() => import('@/components/medico/mcq-generator').then(module => ({ default: module.McqGenerator })));
const StudyTimetableCreator = lazy(() => import('@/components/medico/study-timetable-creator').then(module => ({ default: module.StudyTimetableCreator })));
const FlashcardGenerator = lazy(() => import('@/components/medico/flashcard-generator').then(module => ({ default: module.FlashcardGenerator })));
const SolvedQuestionPapersViewer = lazy(() => import('@/components/medico/solved-question-papers-viewer').then(module => ({ default: module.SolvedQuestionPapersViewer })));
const MnemonicsGenerator = lazy(() => import('@/components/medico/mnemonics-generator').then(module => ({ default: module.MnemonicsGenerator })));
const ClinicalCaseSimulator = lazy(() => import('@/components/medico/clinical-case-simulator').then(module => ({ default: module.ClinicalCaseSimulator })));
const DifferentialDiagnosisTrainer = lazy(() => import('@/components/medico/differential-diagnosis-trainer').then(module => ({ default: module.DifferentialDiagnosisTrainer })));
const PathoMindExplainer = lazy(() => import('@/components/medico/pathomind-explainer').then(module => ({ default: module.PathoMindExplainer })));
const PharmaGenie = lazy(() => import('@/components/medico/pharma-genie').then(module => ({ default: module.PharmaGenie })));
const MicroMate = lazy(() => import('@/components/medico/micro-mate').then(module => ({ default: module.MicroMate })));
const DiagnoBot = lazy(() => import('@/components/medico/diagno-bot').then(module => ({ default: module.DiagnoBot })));
const HighYieldTopicPredictor = lazy(() => import('@/components/medico/high-yield-topic-predictor').then(module => ({ default: module.HighYieldTopicPredictor })));
const AnatomyVisualizer = lazy(() => import('@/components/medico/anatomy-visualizer').then(module => ({ default: module.AnatomyVisualizer })));
const DrugDosageCalculator = lazy(() => import('@/components/medico/drug-dosage-calculator').then(module => ({ default: module.DrugDosageCalculator })));
const NoteSummarizer = lazy(() => import('@/components/medico/note-summarizer').then(module => ({ default: module.NoteSummarizer })));
const VirtualPatientRounds = lazy(() => import('@/components/medico/virtual-patient-rounds').then(module => ({ default: module.VirtualPatientRounds })));
const ProgressTracker = lazy(() => import('@/components/medico/progress-tracker').then(module => ({ default: module.ProgressTracker })));
const SmartDictation = lazy(() => import('@/components/medico/smart-dictation').then(module => ({ default: module.SmartDictation })));
const GamifiedCaseChallenges = lazy(() => import('@/components/medico/gamified-case-challenges').then(module => ({ default: module.GamifiedCaseChallenges })));
const MockExamSuite = lazy(() => import('@/components/medico/mock-exam-suite').then(module => ({ default: module.MockExamSuite })));
const GuidedStudyFlow = lazy(() => import('@/components/medico/guided-study-flow').then(module => ({ default: module.GuidedStudyFlow })));
const SmartSearch = lazy(() => import('@/components/medico/smart-search').then(module => ({ default: module.SmartSearch })));
const ComprehensiveTopicReview = lazy(() => import('@/components/medico/comprehensive-topic-review').then(module => ({ default: module.ComprehensiveTopicReview })));
const MedicoAdvancedNotes = lazy(() => import('@/components/medico/medico-advanced-notes').then(module => ({ default: module.MedicoAdvancedNotes })));

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
  { id: 'q-bank', title: 'Exam Paper Generator', description: "Generate mock exam papers simulating previous years, with MCQs and essay questions.", icon: BookCopy, href: '/medico/mock-pyqs' },
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
  { id: 'flowcharts', title: 'Flowchart Creator', description: 'Generate flowcharts for medical topics to aid revision.', icon: Workflow, href: '/medico/flowchart-creator', comingSoon: false },
  { id: 'dictation', title: 'Smart Dictation', description: 'Use your voice to dictate notes, which AI can help structure.', icon: Mic, component: SmartDictation },
  { id: 'summarizer', title: 'Smart Note Summarizer', description: 'Upload notes (PDF/TXT) and get AI-powered summaries.', icon: FileText, component: NoteSummarizer },
  { id: 'timetable', title: 'Study Timetable Creator', description: 'Plan personalized study schedules.', icon: CalendarClock, component: StudyTimetableCreator },
  { id: 'topics', title: 'High-Yield Topic Predictor', description: 'Suggest priority topics for study based on exam trends or user performance.', icon: TrendingUp, href: '/medico/topics' },
  { id: 'rounds', title: 'Virtual Patient Rounds', description: 'Simulate ward rounds with patient cases.', icon: Users, component: VirtualPatientRounds },
  { id: 'progress', title: 'Progress Tracker', description: 'Track study progress with rewards (gamification).', icon: Award, component: ProgressTracker },
  { id: 'videos', title: 'Video Lecture Library', description: 'Search and find relevant medical video lectures.', icon: Youtube, href: '/medico/videos' },
];

export const frequentlyUsedMedicoToolIds: ActiveToolId[] = allMedicoToolsList
  .filter(t => t.isFrequentlyUsed)
  .map(t => t.id);
