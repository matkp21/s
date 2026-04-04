'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GuidelineRetrievalInputSchema, GuidelineRetrievalOutputSchema } from '../schemas/guideline-retrieval-schemas';
import type { GuidelineRetrievalInput, GuidelineRetrievalOutput } from '../agents/types';

export const guidelineRetrievalFlow = ai.defineFlow(
  {
    name: 'guidelineRetrievalFlow',
    inputSchema: GuidelineRetrievalInputSchema,
    outputSchema: GuidelineRetrievalOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      prompt: `Based on the query "${input.query}", provide a list of relevant medical guidelines. For each guideline, provide a title, a concise summary, and the source. Also include key investigations and management steps if available in the source.`,
      model: googleAI.model('gemini-2.5-flash-preview'),
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

export async function retrieveGuidelines(
  input: GuidelineRetrievalInput
): Promise<GuidelineRetrievalOutput> {
  return guidelineRetrievalFlow(input);
}
