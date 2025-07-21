
import { config } from 'dotenv';
config();

import '@/ai/flows/guideline-retrieval-flow';
import '@/ai/agents/GuidelineRetrievalAgent.ts';
import '@/ai/agents/types';
import '@/ai/agents/SymptomAnalyzerAgent.ts';

// Import evaluation flows so they can be run from the dev UI
import '@/ai/tests/symptom-analysis-eval';
import '@/ai/tests/mcq-generation-eval';
import '@/ai/tests/study-notes-eval';
import '@/ai/tests/flashcard-generation-eval';
