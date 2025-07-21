
// src/ai/agents/medico/ExamPaperAgent.ts
'use server';
/**
 * @fileOverview A Genkit flow for generating mock exam papers on medical topics for medico users.
 * This flow acts as the 'ExamPaperAgent'.
 *
 * - generateExamPaper - A function that handles the mock exam paper generation process.
 * - MedicoExamPaperInput - The input type for the generateExamPaper function.
 * - MedicoExamPaperOutput - The return type for the generateExamPaper function.
 */

import { ai } from '@/ai/genkit';
import { MedicoExamPaperInputSchema, MedicoExamPaperOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoExamPaperInput = z.infer<typeof MedicoExamPaperInputSchema>;
export type MedicoExamPaperOutput = z.infer<typeof MedicoExamPaperOutputSchema>;

export async function generateExamPaper(input: MedicoExamPaperInput): Promise<MedicoExamPaperOutput> {
  return examPaperFlow(input);
}

const examPaperPrompt = ai.definePrompt({
  name: 'medicoExamPaperPrompt',
  input: { schema: MedicoExamPaperInputSchema },
  output: { schema: MedicoExamPaperOutputSchema },
  prompt: `You are an expert medical examiner. Your task is to generate a mock exam paper based on the following criteria.

Exam Type: {{{examType}}}
{{#if year}}Focus Year (for pattern analysis): {{{year}}}{{/if}}
Number of MCQs to generate: {{{count}}}

Instructions:
1.  Based on the exam type (and year if provided), generate a realistic mock paper.
2.  Create a clear and unambiguous set of Multiple Choice Questions (MCQs). For each MCQ:
    - Provide exactly four distinct options. One option must have 'isCorrect' set to true.
    - The other three options should be plausible distractors with 'isCorrect' set to false.
    - Provide a brief explanation for the correct answer.
3.  Generate 2-3 essay-style questions that are typical for this kind of exam. For each essay, provide a brief outline of the expected answer.
4.  The 'topicGenerated' field in your output must be set to "{{{examType}}}".
5.  Generate a 'nextSteps' field with at least two relevant follow-up actions a student could take after reviewing this paper. For example, suggest generating notes for one of the essay topics or creating a study plan.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.**

Example for 'nextSteps':
[
  {
    "title": "Deep Dive into Essay Topic",
    "description": "Generate comprehensive notes for one of the essay questions to prepare a full answer.",
    "toolId": "theorycoach-generator",
    "prefilledTopic": "[First Essay Question Topic]",
    "cta": "Generate Notes"
  },
  {
    "title": "Create a Study Plan",
    "description": "Use the high-yield topic predictor to plan your study schedule for the {{{examType}}} exam.",
    "toolId": "topics",
    "prefilledTopic": "{{{examType}}}",
    "cta": "Predict Topics"
  }
]

Format your output as a valid JSON object.
`,
  config: {
    temperature: 0.6, // More creative for varied questions
  }
});

const examPaperFlow = ai.defineFlow(
  {
    name: 'medicoExamPaperFlow',
    inputSchema: MedicoExamPaperInputSchema,
    outputSchema: MedicoExamPaperOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await examPaperPrompt(input);
      if (!output || (!output.mcqs?.length && !output.essays?.length)) {
        console.error('MedicoExamPaperPrompt did not return valid content for exam:', input.examType);
        throw new Error('Failed to generate exam paper. The AI model did not return the expected output. Please try a different exam type or adjust the parameters.');
      }
      return {...output, topicGenerated: input.examType };
    } catch (err) {
      console.error(`[ExamPaperAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating the exam paper. Please try again.');
    }
  }
);
