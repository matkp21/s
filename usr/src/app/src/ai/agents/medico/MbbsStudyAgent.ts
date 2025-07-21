// src/ai/agents/medico/MbbsStudyAgent.ts
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
  NextStepSchema,
} from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';
import { generate } from '@genkit-ai/googleai';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export type MbbsStudyInput = z.infer<typeof MbbsStudyInputSchema>;
export type MbbsStudyOutput = z.infer<typeof MbbsStudyOutputSchema>;

// This function is kept for tool-use compatibility in the chat agent.
export async function generateStudyNotes(input: z.infer<typeof StudyNotesGeneratorInputSchema>): Promise<z.infer<typeof StudyNotesGeneratorOutputSchema>> {
  const result = await mbbsStudyFlow({
    ...input,
    subject: input.subject || 'General Medicine' // Provide a default if subject is optional
  });
  return {
      notes: result.enhancedContent.summary,
      summaryPoints: result.enhancedContent.bulletPoints,
      diagram: result.enhancedContent.diagramUrl, // Pass diagram URL as a string (Mermaid component can handle URLs)
      nextSteps: result.nextSteps,
  };
}

export async function generateComprehensiveNotes(
  input: MbbsStudyInput
): Promise<MbbsStudyOutput> {
  return mbbsStudyFlow(input);
}

// Define the schema for the text-only output from the first LLM call
const MedGemmaTextOutputSchema = MbbsStudyOutputSchema.extend({
    enhancedContent: MbbsStudyOutputSchema.shape.enhancedContent.extend({
        diagramUrl: z.string().url().optional().describe("This will be populated in a later step."),
    }),
});


const mbbsStudyFlow = ai.defineFlow(
  {
    name: 'mbbsStudyFlow',
    inputSchema: MbbsStudyInputSchema,
    outputSchema: MbbsStudyOutputSchema,
  },
  async (input) => {
    try {
      // Step 1: Concurrently generate text content using MedGemma and an image with Gemini
      console.log(`Starting multi-agent generation for: ${input.topic}`);
      
      const [textResult, imageResult] = await Promise.allSettled([
        // Agent 1: MedGemma for expert text generation
        (async () => {
            const medGemmaPrompt = `
                You are MedGemma, a medical AI expert. Generate structured study material for the topic "${input.topic}".
                The subject is ${input.subject}.
                Consider this is for a ${input.year || 'general'} medical student, studying for a ${input.examType || 'university'} style exam.
                The question depth should be suitable for ${input.marks || 10} marks.
                Return a JSON object that strictly adheres to the provided schema, excluding the 'diagramUrl' field in the 'enhancedContent' for now.
                Focus on providing detailed headings, bullet points, a concise summary, and textbook references.
                Generate at least two relevant nextSteps.
            `;
            const invokeMedGemma = httpsCallable(functions, 'invokeMedGemma');
            const result = await invokeMedGemma({ prompt: medGemmaPrompt });
            const responseData = (result.data as any)?.responseText;
            if (!responseData) throw new Error("MedGemma function returned an empty response.");
            
            const jsonString = responseData.substring(responseData.indexOf('{'), responseData.lastIndexOf('}') + 1);
            const parsedJson = JSON.parse(jsonString);
            const validation = MedGemmaTextOutputSchema.safeParse(parsedJson);
            if (!validation.success) {
                console.error("Zod validation failed for MedGemma (MbbsStudyAgent):", validation.error.flatten());
                throw new Error("MedGemma output did not match the expected schema.");
            }
            return validation.data;
        })(),

        // Agent 2: Gemini for image generation
        (async () => {
             const imageGenPrompt = `Create a simple, clear educational diagram for a medical student about "${input.topic}". The style should be like a clean, modern medical textbook illustration with clear labels.`;
             const { media } = await generate({
                model: 'googleai/gemini-2.0-flash-preview-image-generation',
                prompt: imageGenPrompt,
                config: { responseModalities: ['IMAGE'] },
            });
            return media;
        })()
      ]);

      if (textResult.status === 'rejected') {
          console.error("MedGemma text generation failed:", textResult.reason);
          throw textResult.reason; // If the main content fails, we must throw the error.
      }
      
      const finalOutput = textResult.value;

      if (imageResult.status === 'fulfilled' && imageResult.value.url) {
        finalOutput.enhancedContent.diagramUrl = imageResult.value.url;
      } else {
        console.warn(`Could not generate diagram for "${input.topic}":`, imageResult.status === 'rejected' ? imageResult.reason : "No URL returned");
        // Proceed without a diagram if image generation fails
      }
      
      return finalOutput;

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
