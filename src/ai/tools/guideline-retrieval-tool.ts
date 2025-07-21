
'use server';
/**
 * @fileOverview Defines a Genkit tool for retrieving clinical guidelines.
 * This tool wraps the GuidelineRetrievalAgent flow so it can be used by other agents.
 */

import { ai } from '@/ai/genkit';
import { retrieveGuidelines } from '@/ai/agents/GuidelineRetrievalAgent';
import { GuidelineRetrievalInputSchema, GuidelineRetrievalOutputSchema } from '../schemas/guideline-retrieval-schemas';

export const guidelineRetrievalTool = ai.defineTool(
  {
    name: 'guidelineRetriever',
    description: 'Retrieves clinical guidelines for a given medical condition. Use this to find suggested investigations and management plans.',
    inputSchema: GuidelineRetrievalInputSchema.pick({ query: true }), // Only expose the query field
    outputSchema: GuidelineRetrievalOutputSchema,
  },
  async (input) => {
    // This directly calls the exported async function which internally calls the flow
    return retrieveGuidelines(input);
  }
);
