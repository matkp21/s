// src/ai/tools/medico-tools.ts
'use server';
/**
 * @fileOverview A collection of Genkit tools for Medico mode.
 * These tools can be used by other flows (like the main chat flow) to
 * perform specific medico-related tasks.
 */
import { ai } from '@/ai/genkit';
import { generateStudyNotes } from '@/ai/agents/medico/StudyNotesAgent';
import { generateMCQs } from '@/ai/agents/medico/MCQGeneratorAgent';
import {
  StudyNotesGeneratorInputSchema,
  StudyNotesGeneratorOutputSchema,
  MedicoMCQGeneratorInputSchema,
  MedicoMCQGeneratorOutputSchema,
} from '../schemas/medico-tools-schemas';
import { z } from 'zod';

export const studyNotesTool = ai.defineTool(
  {
    name: 'generateStudyNotes',
    description: 'Generates structured study notes on a given medical topic.',
    inputSchema: StudyNotesGeneratorInputSchema,
    outputSchema: StudyNotesGeneratorOutputSchema,
  },
  async (input) => generateStudyNotes(input)
);

export const mcqGeneratorTool = ai.defineTool(
  {
    name: 'generateMCQs',
    description: 'Generates a specified number of multiple-choice questions on a medical topic.',
    inputSchema: MedicoMCQGeneratorInputSchema,
    outputSchema: MedicoMCQGeneratorOutputSchema,
  },
  async (input) => generateMCQs(input)
);
