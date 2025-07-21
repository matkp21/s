
'use server';
/**
 * @fileOverview An AI agent that analyzes symptoms and provides potential diagnoses.
 * This is a Genkit flow that now uses a guideline retrieval tool to enhance its output.
 *
 * - analyzeSymptoms - A function that takes user-provided symptoms and returns a detailed analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SymptomAnalyzerInputSchema, SymptomAnalyzerOutputSchema } from '../schemas/symptom-analyzer-schemas';
import { guidelineRetrievalTool } from '../tools/guideline-retrieval-tool';

// Export types for use in other modules
export type { SymptomAnalyzerInput, SymptomAnalyzerOutput, DiagnosisItem, InvestigationItem } from '../schemas/symptom-analyzer-schemas';

export async function analyzeSymptoms(input: z.infer<typeof SymptomAnalyzerInputSchema>): Promise<z.infer<typeof SymptomAnalyzerOutputSchema>> {
  return symptomAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomAnalyzerPrompt',
  input: {schema: SymptomAnalyzerInputSchema},
  output: {schema: SymptomAnalyzerOutputSchema},
  tools: [guidelineRetrievalTool],
  prompt: `You are an expert medical AI assistant. Based on the symptoms and patient context provided, your first step is to generate a list of potential differential diagnoses.
For each diagnosis, include a 'name', 'confidence' level ('High', 'Medium', 'Low', 'Possible'), and a 'rationale'.

After identifying the single most likely diagnosis, your second step is to use the 'guidelineRetriever' tool to find its standard investigations and management guidelines.
- Use the name of the most likely diagnosis as the 'query' for the tool.
- Populate the 'suggestedInvestigations' and 'suggestedManagement' fields in your final output using the information returned by the tool.

Symptoms: {{{symptoms}}}
{{#if patientContext.age}}Patient Age: {{{patientContext.age}}}{{/if}}
{{#if patientContext.sex}}Patient Sex: {{{patientContext.sex}}}{{/if}}
{{#if patientContext.history}}Relevant History: {{{patientContext.history}}}{{/if}}

Output Format:
Ensure your output strictly adheres to the SymptomAnalyzerOutputSchema JSON structure.
Always include a standard disclaimer that this is for informational purposes only and is not a substitute for professional medical advice.
`,
});

const symptomAnalyzerFlow = ai.defineFlow(
  {
    name: 'symptomAnalyzerFlow',
    inputSchema: SymptomAnalyzerInputSchema,
    outputSchema: SymptomAnalyzerOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error("Symptom analyzer prompt did not return an output.");
      }
      return output;
    } catch (err) {
      console.error(`[SymptomAnalyzerAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred during symptom analysis. Please try again.');
    }
  }
);
