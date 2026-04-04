
'use server';
/**
 * @fileOverview A comprehensive study agent for MBBS students, using a hybrid AI model.
 * 
 * Architecture:
 * 1. MedGemma (Vertex AI): Expert medical knowledge extraction.
 * 2. Gemma 2 (Vertex AI): Concise summarization and point extraction.
 * 3. Gemini 1.5 Pro (Google AI): Final assembly, textbook referencing, and diagram generation.
 */

import { ai } from '@/ai/genkit';
import {
  MbbsStudyInputSchema,
  MbbsStudyOutputSchema,
  StudyNotesGeneratorOutputSchema,
  StudyNotesGeneratorInputSchema,
} from '@/ai/schemas/medico-tools-schemas';
import { z } from 'genkit';
import { generate } from 'genkit/ai';

export type MbbsStudyInput = z.infer<typeof MbbsStudyInputSchema>;
export type MbbsStudyOutput = z.infer<typeof MbbsStudyOutputSchema>;

export async function generateComprehensiveNotes(input: MbbsStudyInput): Promise<MbbsStudyOutput> {
  return mbbsStudyFlow(input);
}

export async function generateStudyNotes(input: z.infer<typeof StudyNotesGeneratorInputSchema>): Promise<z.infer<typeof StudyNotesGeneratorOutputSchema>> {
  const result = await mbbsStudyFlow({
    topic: input.topic,
    subject: input.subject || 'General Medicine',
    year: 'General',
    examType: 'University',
    marks: '10'
  });
  
  return {
      notes: result.enhancedContent.headings.map(h => `## ${h.title}\n${h.content}`).join('\n\n'),
      summaryPoints: result.enhancedContent.bulletPoints,
      diagram: result.enhancedContent.diagramUrl,
      nextSteps: result.nextSteps,
  };
}

const mbbsStudyFlow = ai.defineFlow(
  {
    name: 'mbbsStudyFlow',
    inputSchema: MbbsStudyInputSchema,
    outputSchema: MbbsStudyOutputSchema,
  },
  async (input) => {
    try {
      console.log(`[MbbsStudyAgent] Starting hybrid generation for: "${input.topic}"`);
      
      const medGemmaResponse = await generate({
        model: 'vertexai/medGemma',
        prompt: `You are MedGemma, a specialized medical AI. Provide a detailed clinical breakdown of "${input.topic}" for an MBBS student. 
        Focus on pathophysiology, diagnostic criteria, and management protocols. 
        Subject: ${input.subject}.`,
      });
      const clinicalBase = medGemmaResponse.text;

      const [summaryResult, imageResult] = await Promise.allSettled([
        generate({
          model: 'vertexai/gemma2',
          prompt: `Based on this clinical data, extract 5 high-yield bullet points for quick revision:\n${clinicalBase}`,
        }),
        generate({
          model: 'googleai/imagen-4.0-fast-generate-001',
          prompt: `A professional medical textbook illustration of ${input.topic}, showing anatomical structures and clinical signs. Clear, educational, high resolution.`,
        })
      ]);

      const bulletPoints = summaryResult.status === 'fulfilled' 
        ? summaryResult.value.text.split('\n').filter(p => p.trim().startsWith('*') || p.trim().startsWith('-')).map(p => p.replace(/^[*-\s]+/, ''))
        : ["Key clinical points extraction failed."];

      const diagramUrl = imageResult.status === 'fulfilled' ? imageResult.value.media?.url : undefined;

      const finalResponse = await generate({
        model: 'googleai/gemini-1.5-pro',
        prompt: `Combine the following clinical data and summary points into a beautifully structured MBBS study note for the topic "${input.topic}".
        
        Clinical Data: ${clinicalBase}
        Summary Points: ${bulletPoints.join(', ')}
        
        Format the output as a JSON object adhering to the MbbsStudyOutputSchema. Include textbook references (e.g., Robbins, Harrison's).
        Generate at least two intelligent 'nextSteps' for further study.`,
        output: {
          format: 'json',
          schema: MbbsStudyOutputSchema,
        }
      });

      const output = finalResponse.output;
      if (!output) throw new Error("Final assembly failed to produce structured output.");

      if (diagramUrl) {
        output.enhancedContent.diagramUrl = diagramUrl;
      }

      return output;

    } catch (err) {
      console.error(`[MbbsStudyAgent] Error:`, err);
      throw new Error('An unexpected error occurred while generating advanced medical notes.');
    }
  }
);
