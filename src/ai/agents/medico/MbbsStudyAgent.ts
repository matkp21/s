
'use server';
/**
 * @fileOverview A comprehensive study agent for MBBS students, now powered by MedGemma.
 *
 * This agent generates structured study material for a given topic,
 * using MedGemma for clinical accuracy and a separate image model for diagrams.
 *
 * - generateComprehensiveNotes - The main function to generate study notes.
 * - MbbsStudyInput - The input schema for the agent.
 * - MbbsStudyOutput - The output schema for the agent.
 */

import { ai } from '@/ai/genkit';
import {
  MbbsStudyInputSchema,
  MbbsStudyOutputSchema,
  StudyNotesGeneratorOutputSchema,
  StudyNotesGeneratorInputSchema,
} from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';
import { generate } from '@genkit-ai/googleai';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export type MbbsStudyInput = z.infer<typeof MbbsStudyInputSchema>;
export type MbbsStudyOutput = z.infer<typeof MbbsStudyOutputSchema>;

export type StudyNotesGeneratorInput = z.infer<typeof StudyNotesGeneratorInputSchema>;
export type StudyNotesGeneratorOutput = z.infer<typeof StudyNotesGeneratorOutputSchema>;

// This function remains for tool-use compatibility in the chat agent.
export async function generateStudyNotes(input: StudyNotesGeneratorInput): Promise<StudyNotesGeneratorOutput> {
  const result = await mbbsStudyFlow({
    ...input,
    subject: input.subject || 'General Medicine' // Provide a default if subject is optional
  });
  return {
      notes: result.enhancedContent.summary,
      summaryPoints: result.enhancedContent.bulletPoints,
      topicGenerated: input.topic,
      diagramUrl: result.enhancedContent.diagramUrl, // Pass diagram URL through
  };
}

export async function generateComprehensiveNotes(
  input: MbbsStudyInput
): Promise<MbbsStudyOutput> {
  return mbbsStudyFlow(input);
}


const mbbsStudyFlow = ai.defineFlow(
  {
    name: 'mbbsStudyFlow',
    inputSchema: MbbsStudyInputSchema,
    outputSchema: MbbsStudyOutputSchema,
  },
  async (input) => {
    try {
      // Step 1: Generate text content using MedGemma via Firebase Function
      const medGemmaPrompt = `
        You are MedGemma, a medical AI expert. Generate structured study material for the topic "${input.topic}".
        The subject is ${input.subject}.
        Consider this is for a ${input.year || 'general'} medical student, studying for a ${input.examType || 'university'} style exam.
        The question depth should be suitable for ${input.marks || 10} marks.

        Return a JSON object that strictly adheres to the MbbsStudyOutputSchema, excluding the 'diagramUrl' field in the 'enhancedContent' for now.
        Focus on providing detailed headings, bullet points, a concise summary, and textbook references.
      `;

      const invokeMedGemma = httpsCallable(functions, 'invokeMedGemma');
      const result = await invokeMedGemma({ prompt: medGemmaPrompt });
      const responseData = (result.data as any)?.responseText;

      if (!responseData) {
        throw new Error("MedGemma function returned an empty response for study notes.");
      }

      let textOutput: MbbsStudyOutput;
      try {
        const jsonString = responseData.substring(responseData.indexOf('{'), responseData.lastIndexOf('}') + 1);
        const parsedJson = JSON.parse(jsonString);
        const validation = MbbsStudyOutputSchema.safeParse(parsedJson);
        if (!validation.success) {
            console.error("Zod validation failed for MedGemma (Study Notes):", validation.error.flatten());
            throw new Error("MedGemma output for study notes did not match the expected schema.");
        }
        textOutput = validation.data;
      } catch (e) {
        console.error("Failed to parse JSON from MedGemma (Study Notes):", e, "Raw:", responseData);
        throw new Error("MedGemma returned data in an unexpected format for study notes.");
      }
      
      // Step 2: Generate an image based on the topic using a different model
      const imageGenPrompt = `Create a simple, clear educational diagram for a medical student about "${input.topic}". The style should be like a clean, modern medical textbook illustration with clear labels.`;
      
      try {
        const { media } = await generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: imageGenPrompt,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });
        textOutput.enhancedContent.diagramUrl = media.url;
      } catch (imageError) {
        console.warn(`Could not generate diagram for study notes on "${input.topic}":`, imageError);
      }
      
      return textOutput;

    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while generating notes.';
      console.error(`[MbbsStudyAgent] Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }
);
