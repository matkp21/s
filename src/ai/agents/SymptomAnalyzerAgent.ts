
'use server';
/**
 * @fileOverview An AI agent that analyzes symptoms and provides potential diagnoses.
 * This is a Genkit flow that can be called from other parts of the application, including the Python backend.
 *
 * - analyzeSymptoms - A function that takes user-provided symptoms and returns a detailed analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SymptomAnalyzerInputSchema, SymptomAnalyzerOutputSchema } from '../schemas/symptom-analyzer-schemas';

// Export types for use in other modules
export type { SymptomAnalyzerInput, SymptomAnalyzerOutput, DiagnosisItem, InvestigationItem } from '../schemas/symptom-analyzer-schemas';

export async function analyzeSymptoms(input: z.infer<typeof SymptomAnalyzerInputSchema>): Promise<z.infer<typeof SymptomAnalyzerOutputSchema>> {
  return symptomAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomAnalyzerPrompt',
  input: {schema: SymptomAnalyzerInputSchema},
  output: {schema: SymptomAnalyzerOutputSchema},
  prompt: `You are an expert medical AI assistant. Based on the symptoms and patient context provided, generate a list of potential differential diagnoses.
For each diagnosis, include a 'name', 'confidence' level ('High', 'Medium', 'Low', 'Possible'), and a 'rationale'.

For the top 1-2 most likely diagnoses, provide a list of 'suggestedInvestigations' (e.g., blood tests, imaging) with a rationale for each, and a list of 'suggestedManagement' steps (e.g., initial treatments).

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
