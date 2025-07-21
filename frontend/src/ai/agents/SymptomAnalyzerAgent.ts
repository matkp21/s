
'use server';
/**
 * @fileOverview An AI agent that analyzes symptoms and provides potential diagnoses.
 *
 * - analyzeSymptoms - A function that takes user-provided symptoms and returns a list of potential diagnoses.
 * - SymptomAnalyzerInput - The input type for the analyzeSymptoms function.
 * - SymptomAnalyzerOutput - The return type for the analyzeSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SymptomAnalyzerInputSchema = z.object({
  symptoms: z.string().describe('A detailed description of the symptoms the user is experiencing.'),
  patientContext: z.object({
    age: z.number().int().positive().optional().describe('Patient age in years.'),
    sex: z.enum(['male', 'female', 'other']).optional().describe('Patient biological sex.'),
    history: z.string().optional().describe('Brief relevant medical history or context.'),
  }).optional(),
});
export type SymptomAnalyzerInput = z.infer<typeof SymptomAnalyzerInputSchema>;

export const DiagnosisItemSchema = z.object({
  name: z.string().describe('The name of the potential diagnosis.'),
  confidence: z.enum(['High', 'Medium', 'Low', 'Possible']).optional().describe('The AI\'s confidence level for this diagnosis.'),
  rationale: z.string().optional().describe('A brief rationale for considering this diagnosis.'),
});
export type DiagnosisItem = z.infer<typeof DiagnosisItemSchema>;


export const SymptomAnalyzerOutputSchema = z.object({
  diagnoses: z.array(DiagnosisItemSchema).describe('A list of potential differential diagnoses, each with a name, confidence, and rationale.'),
  disclaimer: z.string().optional().describe('A standard disclaimer advising consultation with a medical professional.'),
});
export type SymptomAnalyzerOutput = z.infer<typeof SymptomAnalyzerOutputSchema>;

export async function analyzeSymptoms(input: SymptomAnalyzerInput): Promise<SymptomAnalyzerOutput> {
  return symptomAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomAnalyzerPrompt',
  input: {schema: SymptomAnalyzerInputSchema},
  output: {schema: SymptomAnalyzerOutputSchema},
  prompt: `You are an AI medical expert. Based on the symptoms and patient context provided, generate a list of potential differential diagnoses.
For each diagnosis, include a 'name', 'confidence', and 'rationale'.

Symptoms: {{{symptoms}}}
{{#if patientContext}}
Patient Context:
  Age: {{{patientContext.age}}}
  Sex: {{{patientContext.sex}}}
  Relevant History: {{{patientContext.history}}}
{{/if}}

Output Format:
Ensure your output strictly adheres to the SymptomAnalyzerOutputSchema JSON structure.
Always include a disclaimer that this information is for informational purposes only and not a substitute for professional medical advice.
`,
});

const symptomAnalyzerFlow = ai.defineFlow(
  {
    name: 'symptomAnalyzerFlow',
    inputSchema: SymptomAnalyzerInputSchema,
    outputSchema: SymptomAnalyzerOutputSchema,
  },
  async (input: SymptomAnalyzerInput) => {
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
