
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { GuidelineRetrievalInput, GuidelineRetrievalOutput } from './types';
import { generate } from '@genkit-ai/googleai';

// Define the Genkit flow within the agent file itself
export const guidelineRetrievalFlow = ai.defineFlow(
  {
    name: 'guidelineRetrievalFlow',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({ guidelines: z.array(z.string()) }),
  },
  async (input) => {
    const llmResponse = await generate({
      prompt: `Based on the query "${input.query}", provide relevant medical guidelines.`,
      model: 'googleai/gemini-pro',
      output: {
        format: 'json',
        schema: z.object({ guidelines: z.array(z.string()) }),
      },
    });

    const output = llmResponse.output();
    if (!output) {
      return { guidelines: [] };
    }
    return output;
  }
);

// The exported function remains the same, but now it calls the local flow
export async function retrieveGuidelines(
  input: GuidelineRetrievalInput
): Promise<GuidelineRetrievalOutput> {
  return guidelineRetrievalFlow(input);
}
