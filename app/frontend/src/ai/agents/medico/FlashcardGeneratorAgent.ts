
'use server';
/**
 * @fileOverview A Genkit flow for generating flashcards on medical topics for medico users.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - MedicoFlashcardGeneratorInput - The input type.
 * - MedicoFlashcardGeneratorOutput - The return type for the generateFlashcards function.
 */

import { ai } from '@/ai/genkit';
import { MedicoFlashcardGeneratorInputSchema, MedicoFlashcardGeneratorOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';
import { generate } from 'genkit/ai';

export type MedicoFlashcardGeneratorInput = z.infer<typeof MedicoFlashcardGeneratorInputSchema>;
export type MedicoFlashcardGeneratorOutput = z.infer<typeof MedicoFlashcardGeneratorOutputSchema>;
export type { MedicoFlashcard } from '@/ai/schemas/medico-tools-schemas';

export async function generateFlashcards(input: MedicoFlashcardGeneratorInput): Promise<MedicoFlashcardGeneratorOutput> {
  return flashcardGeneratorFlow(input);
}

const flashcardGeneratorFlow = ai.defineFlow(
  {
    name: 'medicoFlashcardGeneratorFlow',
    inputSchema: MedicoFlashcardGeneratorInputSchema,
    outputSchema: MedicoFlashcardGeneratorOutputSchema,
  },
  async (input) => {
    try {
      const prompt = `You are an AI assistant skilled in creating educational flashcards. Your primary task is to generate a JSON object containing a set of flashcards AND a list of relevant next study steps.

The JSON object you generate MUST have 'flashcards', 'topicGenerated', and a 'nextSteps' field.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions based on the topic.

Example for 'nextSteps':
[
  {
    "title": "Test Your Knowledge",
    "description": "Generate MCQs to test your recall on ${input.topic}.",
    "toolId": "mcq",
    "prefilledTopic": "${input.topic}",
    "cta": "Generate 5 MCQs"
  },
  {
    "title": "Get the Full Picture",
    "description": "Generate structured study notes to understand the core concepts of ${input.topic}.",
    "toolId": "notes-generator",
    "prefilledTopic": "${input.topic}",
    "cta": "Generate Study Notes"
  }
]
---

**Instructions for flashcard generation:**
Topic: ${input.topic}
Difficulty: ${input.difficulty}
Exam Style: ${input.examType}
Number of flashcards to generate: ${input.count}

For each flashcard, create a 'front' (question or term) and a 'back' (answer or definition).
The flashcards should be concise and focus on key, high-yield information relevant to the topic, difficulty, and exam style.
The 'topicGenerated' field must be set to "${input.topic}".

Format the entire output as a valid JSON object.
`;

      const { output } = await generate({
        model: 'googleai/gemini-1.5-pro-latest',
        prompt,
        output: {
          format: 'json',
          schema: MedicoFlashcardGeneratorOutputSchema,
        },
        config: {
          temperature: 0.4, // Factual and concise
        }
      });

      if (!output || !output.flashcards || output.flashcards.length === 0) {
        console.error('MedicoFlashcardGeneratorPrompt did not return valid flashcards for topic:', input.topic);
        throw new Error('Failed to generate flashcards. The AI model did not return the expected output or returned an empty set. Please try a different topic.');
      }
      return { ...output, topicGenerated: input.topic };
    } catch (err) {
      console.error(`[FlashcardGeneratorAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating flashcards. Please check your connection and try again.');
    }
  }
);
