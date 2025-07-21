
'use server';
/**
 * @fileOverview Defines Genkit tools for Medico-specific study functionalities.
 * These tools wrap existing agent flows to be used by other agents, like the chat agent.
 */

import { ai } from '@/ai/genkit';
import { generateMCQs } from '@/ai/agents/medico/MCQGeneratorAgent';
import { generateStudyNotes } from '@/ai/agents/medico/StudyNotesAgent';
import { 
  MedicoMCQGeneratorInputSchema, 
  MedicoMCQGeneratorOutputSchema,
  StudyNotesGeneratorInputSchema,
  StudyNotesGeneratorOutputSchema,
} from '@/ai/schemas/medico-tools-schemas';
import { z } from 'zod';

/**
 * A tool to generate Multiple Choice Questions (MCQs) for a given medical topic.
 */
export const mcqGeneratorTool = ai.defineTool(
  {
    name: 'mcqGenerator',
    description: 'Generates a number of multiple-choice questions (MCQs) for a specified medical topic. Useful for creating quizzes or practice tests.',
    inputSchema: MedicoMCQGeneratorInputSchema.pick({ topic: true, count: true }), // Only expose essential fields
    outputSchema: MedicoMCQGeneratorOutputSchema,
  },
  async (input) => {
    // Call the full agent function with default values for other parameters
    return generateMCQs({
        ...input,
        difficulty: 'medium',
        examType: 'university',
    });
  }
);

/**
 * A tool to generate structured study notes for a given medical topic.
 */
export const studyNotesGeneratorTool = ai.defineTool(
    {
        name: 'studyNotesGenerator',
        description: 'Generates comprehensive, structured study notes on a specific medical topic.',
        inputSchema: z.object({
            topic: z.string().describe("The medical topic to generate notes for.")
        }),
        outputSchema: StudyNotesGeneratorOutputSchema,
    },
    async (input) => {
        // Call the full agent function with default values
        return generateStudyNotes({
            ...input,
            answerLength: '10-mark',
        });
    }
);

    