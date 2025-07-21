
// src/ai/agents/pro/systemDiagnosticsAgent.ts
'use server';
/**
 * @fileOverview An AI agent to analyze system diagnostics data and provide improvement suggestions.
 * This demonstrates a two-step tool-use pattern: first call a function to get data,
 * then feed that data to an LLM to get reasoned insights.
 *
 * - generateImprovementSuggestions - A function that takes diagnostics data and returns AI suggestions.
 * - SystemDiagnosticInput - The input type for the flow.
 * - SystemDiagnosticOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { SystemDiagnosticInputSchema, ImprovementSuggestionsOutputSchema } from '@/ai/schemas/pro-schemas';
import type { z } from 'zod';

export type SystemDiagnosticInput = z.infer<typeof SystemDiagnosticInputSchema>;
export type ImprovementSuggestionsOutput = z.infer<typeof ImprovementSuggestionsOutputSchema>;

export async function generateImprovementSuggestions(input: SystemDiagnosticInput): Promise<ImprovementSuggestionsOutput> {
  return generateSuggestionsFlow(input);
}

const suggestionsPrompt = ai.defineDotprompt({
  name: 'proGenerateSuggestionsPrompt',
  promptPath: 'prompts/pro/system-diagnostics.prompt',
});


const generateSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateSuggestionsFlow',
    inputSchema: SystemDiagnosticInputSchema,
    outputSchema: ImprovementSuggestionsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await suggestionsPrompt(input);
      if (!output || !output.suggestions) {
        console.error("GenerateSuggestionsPrompt did not return valid suggestions.");
        throw new Error('AI failed to generate improvement suggestions.');
      }
      return output;
    } catch (err) {
      console.error(`[SystemDiagnosticsAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating suggestions.');
    }
  }
);
