'use server';
/**
 * @fileOverview The Knowledge Augmenter agent.
 * This agent analyzes a student's notes to answer a question and augment the answer
 * with critical missing information, using Gemini 3 Pro.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { KnowledgeAugmenterInputSchema, KnowledgeAugmenterOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

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
    const systemInstruction = `
      You are an expert Medical Tutor and a Textbook Validator. Your primary goal is to 
      ensure the student's knowledge is complete and clinically accurate.

      Follow this three-step process precisely:
      1. DECODE: Accurately read and interpret the attached notes, including handwritten text and medical shorthand.
      2. VALIDATE: Compare the content from the student's notes against your comprehensive medical knowledge to identify critical missing information related to the student's question.
      3. AUGMENT: Provide the final answer by combining the information from the student's notes WITH the missing critical details.
      
      Always present the output clearly in the required JSON structure.
    `;

    const mainPrompt = `
      Based on the attached file, analyze the content relevant to the student's question.

      Student's Question: **${input.question}**

      Your response must be a JSON object with the following three fields: "augmentedAnswer", "missingInfo", and "shorthandKey".
    `;

    try {
      const llmResponse = await ai.generate({
        model: googleAI('gemini-3-pro-preview'),
        system: systemInstruction,
        prompt: [
          { media: { url: input.fileDataUri } },
          { text: mainPrompt },
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
      if (!output) {
        throw new Error("The AI model did not return a valid response.");
      }

      return output;

    } catch (err) {
      console.error(`[KnowledgeAugmenterAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred during knowledge augmentation.');
    }
  }
);
