
'use server';
/**
 * @fileOverview AI-powered medical image annotation flow.
 * Aims for general analysis, with future aspirations to integrate specialized models
 * like MedGemma for expert-level interpretation in fields like radiology.
 *
 * - analyzeImage - A function that analyzes a medical image and provides annotations.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the analyzeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generate } from 'genkit/ai';
import { media } from 'genkit/content';

const AnalyzeImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A medical image (e.g., X-ray, CT scan) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

// Updated Annotation structure
const AnnotationSchema = z.object({
  text: z.string().describe("A textual description of the finding or area of interest."),
  position: z.object({
    x: z.number().min(0).max(1).describe("Normalized x-coordinate (0.0 to 1.0) of the annotation's center."),
    y: z.number().min(0).max(1).describe("Normalized y-coordinate (0.0 to 1.0) of the annotation's center."),
  }).describe("The normalized position of the annotation on the image."),
});
export type Annotation = z.infer<typeof AnnotationSchema>;


const AnalyzeImageOutputSchema = z.object({
  annotations: z.array(AnnotationSchema).describe('AI-powered annotations highlighting key areas of interest. Each annotation includes text and a normalized position (x, y).'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async input => {
    try {
        const llmResponse = await generate({
          model: 'googleai/gemini-1.5-pro-latest',
          prompt: [
            media({ url: input.imageDataUri }),
            `You are a medical imaging analysis AI. You are provided with a medical image. Your task is to identify key areas of interest or potential abnormalities.
For each finding, provide:
1. A concise textual description ('text').
2. A normalized position ('position') for where this finding is located on the image. The position should be an object with 'x' and 'y' coordinates, where both x and y are numbers between 0.0 (top/left) and 1.0 (bottom/right), representing the center of the finding.

Format your output as a JSON object strictly conforming to the AnalyzeImageOutputSchema, specifically:
{
  "annotations": [
    { "text": "Description of finding 1", "position": { "x": 0.25, "y": 0.3 } },
    { "text": "Description of finding 2", "position": { "x": 0.7, "y": 0.65 } }
  ]
}
If no specific findings are apparent, return an empty "annotations" array: { "annotations": [] }.
Focus on identifying 2-3 key points if possible.
`,
          ],
          output: {
            format: 'json',
            schema: AnalyzeImageOutputSchema,
          }
        });

        const output = llmResponse.output();
        if (!output) {
        console.error("Image analysis prompt did not return an output for image:", input.imageDataUri ? input.imageDataUri.substring(0,50) + "..." : "undefined");
        return { annotations: [] };
        }
        return output;
    } catch (err) {
        console.error(`[ImageAnalyzerAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
        throw new Error('An unexpected error occurred during image analysis. Please try again.');
    }
  }
);
