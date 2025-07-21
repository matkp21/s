// src/ai/agents/medico/StudyNotesAgent.ts
'use server';
/**
 * @fileOverview A Genkit flow for generating structured, exam-style study notes on medical topics.
 * This acts as the "StudyNotesGenerator" for medico users.
 *
 * - generateStudyNotes - A function that handles the answer generation process.
 * - StudyNotesGeneratorInput - The input type for the generateStudyNotes function.
 * - StudyNotesGeneratorOutput - The return type for the generateStudyNotes function.
 */

import { ai } from '@/ai/genkit';
import { StudyNotesGeneratorInputSchema, StudyNotesGeneratorOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type StudyNotesGeneratorInput = z.infer<typeof StudyNotesGeneratorInputSchema>;
export type StudyNotesGeneratorOutput = z.infer<typeof StudyNotesGeneratorOutputSchema>;

export async function generateStudyNotes(input: StudyNotesGeneratorInput): Promise<StudyNotesGeneratorOutput> {
  const result = await studyNotesFlow(input);
  return result;
}

const studyNotesPrompt = ai.definePrompt({
  name: 'medicoStudyNotesPrompt',
  input: { schema: StudyNotesGeneratorInputSchema },
  output: { schema: StudyNotesGeneratorOutputSchema },
  prompt: `You are an AI medical expert. Your primary task is to generate a comprehensive JSON object containing structured study notes AND a list of relevant next study steps for a medical student.

The JSON object you generate MUST have four fields: 'notes', 'summaryPoints', 'diagram', and 'nextSteps'.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions based on the topic.

Example for 'nextSteps':
[
  {
    "title": "Test Your Knowledge",
    "description": "Generate MCQs to test your recall on {{{topic}}}.",
    "toolId": "mcq",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Generate 5 MCQs"
  },
  {
    "title": "Create Flashcards",
    "description": "Create flashcards for the key points of {{{topic}}}.",
    "toolId": "flashcards",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Create Flashcards"
  }
]
---

**Instructions for notes generation:**
Topic/Question: {{{topic}}}
Desired Answer Length: {{{answerLength}}}

1.  **'notes' field**: Generate comprehensive notes on the topic. Strictly follow this 11-point format, using Markdown headings (e.g., '## 1. Definition'):
    1.  **Definition**: Provide a clear, concise definition.
    2.  **Relevant Anatomy / Physiology**: Briefly mention if critical to understanding the topic.
    3.  **Etiology / Risk Factors**: List the causes and risk factors.
    4.  **Pathophysiology**: Explain the mechanism of the disease.
    5.  **Clinical Features**: Detail the signs and symptoms.
    6.  **Investigations**: List relevant investigations under subheadings (Blood tests, Imaging, Special tests).
    7.  **Management**: Detail the management under subheadings (Medical, Surgical if applicable).
    8.  **Complications**: List potential complications.
    9.  **Prognosis**: Briefly describe the likely outcome.
    10. **Flowcharts / Tables / Diagrams**: Generate a relevant flowchart or table using Mermaid.js syntax. For example, a diagnostic pathway or a classification table. The diagram should be useful for visual learners. This Mermaid code goes into the 'diagram' field of the JSON output, NOT here in the notes.
    11. **References**: Name 1-2 standard textbooks (e.g., Robbins, Ghai, Bailey & Love) where this topic is covered.

2.  **'summaryPoints' field**: Create a separate array of 3-5 key, high-yield summary points for quick revision. Each point should be a string.

3.  **'diagram' field**: Place the Mermaid.js syntax generated in step 10 into this field as a single string. If no diagram is relevant, this can be null.

Constraint: For a '10-mark' answer, the 'notes' content should be around 500 words. For a '5-mark' answer, around 250 words.
Ensure the entire response is a single valid JSON object conforming to the StudyNotesGeneratorOutputSchema.
`,
  config: {
    temperature: 0.3, // Factual for notes
  }
});

const studyNotesFlow = ai.defineFlow(
  {
    name: 'medicoStudyNotesFlow',
    inputSchema: StudyNotesGeneratorInputSchema,
    outputSchema: StudyNotesGeneratorOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await studyNotesPrompt(input);
      if (!output || !output.notes) {
        console.error('StudyNotesPrompt did not return an output for topic:', input.topic);
        throw new Error('Failed to generate study notes. The AI model did not return the expected output. Please try a different topic or rephrase.');
      }
      return output;
    } catch (err) {
      console.error(`[StudyNotesAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating study notes. Please try again.');
    }
  }
);
