
'use server';
/**
 * @fileOverview A Genkit flow for generating structured, exam-style study notes.
 */

import { ai } from '@/ai/genkit';
import { StudyNotesGeneratorInputSchema, StudyNotesGeneratorOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type StudyNotesGeneratorInput = z.infer<typeof StudyNotesGeneratorInputSchema>;
export type StudyNotesGeneratorOutput = z.infer<typeof StudyNotesGeneratorOutputSchema>;

export async function generateStudyNotes(input: StudyNotesGeneratorInput): Promise<StudyNotesGeneratorOutput> {
  return studyNotesFlow(input);
}

const studyNotesFlow = ai.defineFlow(
  {
    name: 'medicoStudyNotesFlow',
    inputSchema: StudyNotesGeneratorInputSchema,
    outputSchema: StudyNotesGeneratorOutputSchema,
  },
  async (input) => {
    try {
        const prompt = `You are an AI medical expert. Your primary task is to generate a comprehensive JSON object containing structured study notes AND a list of relevant next study steps for a medical student.

The JSON object you generate MUST have four fields: 'notes', 'summaryPoints', 'diagram', and 'nextSteps'.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions based on the topic.

---

**Instructions for notes generation:**
Topic/Question: ${input.topic}
Desired Answer Length: ${input.answerLength}
${input.subject ? `Subject: ${input.subject}` : ''}
${input.system ? `System: ${input.system}` : ''}

1.  **'notes' field**: Generate comprehensive notes on the topic. Use Markdown headings.
2.  **'summaryPoints' field**: Create a separate array of 3-5 key, high-yield summary points.
3.  **'diagram' field**: Generate Mermaid.js syntax for a flowchart or table.

Ensure the response conforms to the StudyNotesGeneratorOutputSchema.
`;

      const llmResponse = await ai.generate({
          model: 'googleai/gemini-1.5-pro',
          prompt: prompt,
          output: {
            format: 'json',
            schema: StudyNotesGeneratorOutputSchema,
          },
          config: {
            temperature: 0.3,
          }
      });

      const output = llmResponse.output;
      if (!output || !output.notes) {
        throw new Error('Failed to generate study notes. The AI model did not return the expected output.');
      }
      return output;
    } catch (err) {
      console.error(`[StudyNotesAgent] Error:`, err);
      throw new Error('An unexpected error occurred while generating study notes.');
    }
  }
);
