
'use server';
/**
 * @fileOverview A Genkit flow for generating mnemonics for medical topics for medico users.
 *
 * - generateMnemonic - A function that handles mnemonic generation.
 * - MedicoMnemonicsGeneratorInput - The input type.
 * - MedicoMnemonicsGeneratorOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { generate } from 'genkit/ai';
import { MedicoMnemonicsGeneratorInputSchema, MedicoMnemonicsGeneratorOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoMnemonicsGeneratorInput = z.infer<typeof MedicoMnemonicsGeneratorInputSchema>;
export type MedicoMnemonicsGeneratorOutput = z.infer<typeof MedicoMnemonicsGeneratorOutputSchema>;

export async function generateMnemonic(input: MedicoMnemonicsGeneratorInput): Promise<MedicoMnemonicsGeneratorOutput> {
  return mnemonicsGeneratorFlow(input);
}

const mnemonicsTextPrompt = ai.definePrompt({
  name: 'medicoMnemonicsTextPrompt',
  input: { schema: MedicoMnemonicsGeneratorInputSchema },
  // Output only the text part first
  output: { schema: MedicoMnemonicsGeneratorOutputSchema.omit({ imageUrl: true }) },
  prompt: `You are an AI expert in creating mnemonics for medical students. Your primary task is to generate a JSON object containing a mnemonic, its explanation, AND a list of relevant next study steps for the topic: {{{topic}}}.

The JSON object you generate MUST have a 'mnemonic' field, an 'explanation' field, a 'topicGenerated' field, and a 'nextSteps' field.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions.

Example for 'nextSteps':
[
  {
    "title": "Create Flashcards",
    "description": "Create flashcards for the items covered by this mnemonic to reinforce learning.",
    "toolId": "flashcards",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Create Flashcards"
  },
  {
    "title": "Generate Study Notes",
    "description": "Generate detailed notes to understand the clinical context behind the topic.",
    "toolId": "notes-generator",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Generate Notes"
  }
]
---

**Instructions for mnemonic generation:**
The mnemonic should be creative and easy-to-remember for the topic: {{{topic}}}.
The explanation should detail what each part of the mnemonic stands for.
The 'topicGenerated' field must be set to "{{{topic}}}".

Format the entire output as a valid JSON object.
`,
  config: {
    temperature: 0.7, // Creative for mnemonics
  }
});

const mnemonicsGeneratorFlow = ai.defineFlow(
  {
    name: 'medicoMnemonicsGeneratorFlow',
    inputSchema: MedicoMnemonicsGeneratorInputSchema,
    outputSchema: MedicoMnemonicsGeneratorOutputSchema,
  },
  async (input) => {
    try {
      // Step 1: Generate the mnemonic text and explanation
      const { output: textOutput } = await mnemonicsTextPrompt(input);

      if (!textOutput || !textOutput.mnemonic) {
        console.error('MedicoMnemonicsGeneratorPrompt did not return a valid mnemonic for topic:', input.topic);
        throw new Error('Failed to generate mnemonic text. The AI model did not return the expected output.');
      }
      
      // Step 2: Generate an image based on the generated mnemonic text
      let imageUrl: string | undefined = undefined;
      try {
        const imageGenPrompt = `Create a simple, clear, and memorable visual diagram or cartoon that illustrates the medical mnemonic: "${textOutput.mnemonic}". The style should be like a clean, modern medical textbook illustration with clear, simple labels if necessary. Focus on making the visual connection to the mnemonic's words obvious.`;
        const { media } = await generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: imageGenPrompt,
            config: {
                responseModalities: ['IMAGE'],
            },
        });
        imageUrl = media.url;
      } catch (imageError) {
        console.warn(`Could not generate diagram for mnemonic on "${input.topic}":`, imageError);
        // We can proceed without an image if it fails
      }

      return {
        ...textOutput,
        imageUrl,
      };

    } catch (err) {
      console.error(`[MnemonicsGeneratorAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating the mnemonic. Please try again.');
    }
  }
);
