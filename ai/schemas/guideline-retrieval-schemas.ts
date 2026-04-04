import { z } from 'genkit';

export const GuidelineRetrievalInputSchema = z.object({
  query: z.string().describe('The medical condition or treatment to query guidelines for.'),
  context: z.string().optional().describe('Optional context, e.g., patient type.'),
});
export type GuidelineRetrievalInput = z.infer<typeof GuidelineRetrievalInputSchema>;

export const GuidelineItemSchema = z.object({
  title: z.string().describe('The title of the guideline.'),
  summary: z.string().describe('A concise summary of the key points.'),
  source: z.string().optional().describe('The primary source of the guideline.'),
  investigations: z.array(z.string()).optional().describe('Key investigations.'),
  management: z.array(z.string()).optional().describe('Key management steps.'),
});
export type GuidelineItem = z.infer<typeof GuidelineItemSchema>;

export const GuidelineRetrievalOutputSchema = z.object({
  results: z.array(GuidelineItemSchema).describe('A list of relevant clinical guidelines.'),
});
export type GuidelineRetrievalOutput = z.infer<typeof GuidelineRetrievalOutputSchema>;
