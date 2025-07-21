
import { config } from 'dotenv';
config();

import '@/ai/flows/guideline-retrieval-flow';
import '@/ai/agents/GuidelineRetrievalAgent.ts';
import '@/ai/agents/types';
import '@/ai/agents/SymptomAnalyzerAgent.ts';
