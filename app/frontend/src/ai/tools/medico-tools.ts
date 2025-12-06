
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
  StudyNotesGeneratorOutputSchema,
  MedicoMCQGeneratorOutputSchema,
} from '../schemas/medico-tools-schemas';
import { z } from 'zod';

export const studyNotesTool = ai.defineTool(
  {
    name: 'generateStudyNotes',
    description: 'Generates structured study notes on a given medical topic. Use with a command like "/notes <topic>".',
    inputSchema: z.object({ topic: z.string() }),
    outputSchema: StudyNotesGeneratorOutputSchema,
  },
  async (input) => await generateStudyNotes({
    topic: input.topic,
    answerLength: '10-mark' // Default length for chat-based generation
  })
);

export const mcqGeneratorTool = ai.defineTool(
  {
    name: 'generateMCQs',
    description: 'Generates a specified number of multiple-choice questions on a medical topic. Use with a command like "/mcq <topic> [count]".',
    inputSchema: z.object({
        topic: z.string(),
        count: z.number().optional().default(5),
    }),
    outputSchema: MedicoMCQGeneratorOutputSchema,
  },
  async (input) => await generateMCQs({
    topic: input.topic,
    count: input.count,
    difficulty: 'medium',
    examType: 'university',
  })
);
