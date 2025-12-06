// src/ai/agents/medico/MbbsStudyAgent.ts
'use server';
/**
 * @fileOverview A comprehensive study agent for MBBS students, now powered by MedGemma on Vertex AI.
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
import { generate } from 'genkit/ai';
import { googleAI } from '@genkit-ai/google-genai';
import { vertexAI } from '@genkit-ai/vertexai';

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
      diagram: result.enhancedContent.diagramUrl, // Pass diagram URL as a string
      nextSteps: result.nextSteps,
  };
}

export async function generateComprehensiveNotes(
  input: MbbsStudyInput
): Promise<MbbsStudyOutput> {
  return mbbsStudyFlow(input);
}

// Define the schema for the text-only output from MedGemma
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
      console.log(`[MbbsStudyAgent] Starting multi-agent generation for topic: "${input.topic}"`);
      
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
            console.log(`[MbbsStudyAgent] Invoking MedGemma via Vertex AI for text generation...`);

            const { output } = await generate({
              model: vertexAI('medGemma'),
              prompt: medGemmaPrompt,
              output: {
                format: 'json',
                schema: MedGemmaTextOutputSchema,
              },
              config: {
                temperature: 0.2, 
                maxOutputTokens: 2048, 
              }
            });
            
            if (!output) {
                throw new Error("MedGemma on Vertex AI returned an empty response.");
            }
            console.log(`[MbbsStudyAgent] MedGemma text generation successful.`);
            return output;
        })(),

        // Agent 2: Gemini for image generation
        (async () => {
             const imageGenPrompt = `A simple, clear, modern medical textbook-style educational diagram illustrating the key concepts of "${input.topic}". Ensure labels are clear and concise.`;
             console.log(`[MbbsStudyAgent] Invoking image generation model...`);
             const { media } = await generate({
                model: googleAI('imagen-4.0-fast-generate-001'),
                prompt: imageGenPrompt
            });
            console.log(`[MbbsStudyAgent] Image generation successful.`);
            return media;
        })()
      ]);

      if (textResult.status === 'rejected') {
          console.error("[MbbsStudyAgent] MedGemma text generation failed:", textResult.reason);
          throw textResult.reason; // If the main content fails, we must throw the error.
      }
      
      const finalOutput = textResult.value;

      if (imageResult.status === 'fulfilled' && imageResult.value?.url) {
        finalOutput.enhancedContent.diagramUrl = imageResult.value.url;
        console.log(`[MbbsStudyAgent] Diagram successfully attached to the output.`);
      } else {
        console.warn(`[MbbsStudyAgent] Could not generate diagram for "${input.topic}":`, imageResult.status === 'rejected' ? imageResult.reason : "No URL returned");
      }
      
      console.log(`[MbbsStudyAgent] Final study package assembled successfully.`);
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
