
'use server';
/**
 * @fileOverview A Genkit flow for generating Multiple Choice Questions (MCQs) on medical topics for medico users.
 */

import { ai } from '@/ai/genkit';
import { MedicoMCQGeneratorInputSchema, MedicoMCQGeneratorOutputSchema, MCQSchema as SingleMCQSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoMCQGeneratorInput = z.infer<typeof MedicoMCQGeneratorInputSchema>;
export type MedicoMCQGeneratorOutput = z.infer<typeof MedicoMCQGeneratorOutputSchema>;
export type MCQSchema = z.infer<typeof SingleMCQSchema>; 

export async function generateMCQs(input: MedicoMCQGeneratorInput): Promise<MedicoMCQGeneratorOutput> {
  return mcqGeneratorFlow(input);
}

const mcqGeneratorFlow = ai.defineFlow(
  {
    name: 'medicoMCQGeneratorFlow',
    inputSchema: MedicoMCQGeneratorInputSchema,
    outputSchema: MedicoMCQGeneratorOutputSchema,
  },
  async (input) => {
    try {
      const prompt = `You are an AI expert in medical education. Your primary task is to generate a JSON object containing a quiz AND a list of relevant next study steps.

The JSON object you generate MUST have an 'mcqs' array, a 'topicGenerated' string, and a 'nextSteps' field.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions based on the topic.

---

**Instructions for quiz generation:**
Generate a quiz based on the following criteria:
Topic: ${input.topic}
${input.subject ? `Subject: ${input.subject}` : ''}
${input.system ? `System: ${input.system}` : ''}
Difficulty: ${input.difficulty}
Exam Style: ${input.examType}
Number of MCQs to generate: ${input.count}

For each MCQ:
1.  Create a clear and unambiguous question based on the medical topic.
2.  Provide exactly four distinct options (A, B, C, D).
3.  Ensure one option is clearly the correct answer.
4.  Provide a brief explanation.
5. The 'topicGenerated' field must be set to "${input.topic}".

Ensure the final output is a single valid JSON object.
`;
      const llmResponse = await ai.generate({
          model: 'googleai/gemini-2.5-flash-preview',
          prompt,
          output: {
              format: 'json',
              schema: MedicoMCQGeneratorOutputSchema
          },
          config: {
              temperature: 0.5
          }
      });

      const output = llmResponse.output;
      if (!output || !output.mcqs || output.mcqs.length === 0) {
        console.error('MedicoMCQGeneratorPrompt did not return valid MCQs for topic:', input.topic);
        throw new Error('Failed to generate MCQs. The AI model did not return the expected output.');
      }
      return {...output, topicGenerated: input.topic };
    } catch (err) {
      console.error(`[MCQGeneratorAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating MCQs. Please try again.');
    }
  }
);
