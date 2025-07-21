
'use server';

import { ai } from '@/ai/genkit';
import { GuidelineRetrievalInputSchema, GuidelineRetrievalOutputSchema } from '../schemas/guideline-retrieval-schemas';
import type { GuidelineRetrievalInput, GuidelineRetrievalOutput } from './types';


// Define the Genkit flow within the agent file itself
export const guidelineRetrievalFlow = ai.defineFlow(
  {
    name: 'guidelineRetrievalFlow',
    inputSchema: GuidelineRetrievalInputSchema,
    outputSchema: GuidelineRetrievalOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      prompt: `Based on the query "${input.query}", provide a list of relevant medical guidelines. For each guideline, provide a title, a concise summary, and the source.`,
      model: 'googleai/gemini-pro',
      output: {
        format: 'json',
        schema: GuidelineRetrievalOutputSchema,
      },
    });
    
    const output = llmResponse.output;
    if (!output) {
      return { results: [] };
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
