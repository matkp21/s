'use server';
/**
 * @fileOverview The Knowledge Augmenter agent using the hybrid model.
 * It leverages Gemini 1.5 Pro for multi-modal analysis and textbook validation.
 */

import { ai } from '@/ai/genkit';
import { KnowledgeAugmenterInputSchema, KnowledgeAugmenterOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';
import { generate } from 'genkit/ai';

export type KnowledgeAugmenterInput = z.infer<typeof KnowledgeAugmenterInputSchema>;
export type KnowledgeAugmenterOutput = z.infer<typeof KnowledgeAugmenterOutputSchema>;

export async function validateAndAugmentNotes(input: KnowledgeAugmenterInput): Promise<KnowledgeAugmenterOutput> {
  return knowledgeAugmenterFlow(input);
}

const knowledgeAugmenterFlow = ai.defineFlow(
  {
    name: 'knowledgeAugmenterFlow',
    inputSchema: KnowledgeAugmenterInputSchema,
    outputSchema: KnowledgeAugmenterOutputSchema,
  },
  async (input) => {
    try {
      const llmResponse = await generate({
        model: 'googleai/gemini-1.5-pro',
        system: `You are an expert Medical Tutor. 
        1. DECODE: Read notes including medical shorthand.
        2. VALIDATE: Compare against expert medical knowledge.
        3. AUGMENT: Provide an answer integrating notes with missing safety or clinical details.`,
        prompt: [
          { media: { url: input.fileDataUri } },
          { text: `Analyze the attached notes to answer this question: "${input.question}". 
          Return a structured JSON object with augmentedAnswer, missingInfo list, and shorthandKey list.` },
        ],
        output: {
          format: 'json',
          schema: KnowledgeAugmenterOutputSchema,
        },
        config: {
          temperature: 0.2, 
        }
      });
      
      const output = llmResponse.output;
      if (!output) throw new Error("The AI model did not return a valid response.");
      return output;

    } catch (err) {
      console.error(`[KnowledgeAugmenterAgent] Error:`, err);
      throw new Error('An unexpected error occurred during knowledge augmentation.');
    }
  }
);
