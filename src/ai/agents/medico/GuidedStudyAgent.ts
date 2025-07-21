// src/ai/agents/medico/GuidedStudyAgent.ts
'use server';
/**
 * @fileOverview An orchestrator agent that creates a full study package from a single topic.
 *
 * - generateGuidedStudySession - The main orchestrator flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  GuidedStudyInputSchema,
  GuidedStudyOutputSchema,
} from '@/ai/schemas/medico-tools-schemas';
import { generateStudyNotes } from './StudyNotesAgent';
import { generateMCQs } from './MCQGeneratorAgent';
import { generateFlashcards } from './FlashcardGeneratorAgent';

export async function generateGuidedStudySession(
  input: z.infer<typeof GuidedStudyInputSchema>
): Promise<z.infer<typeof GuidedStudyOutputSchema>> {
  return guidedStudyFlow(input);
}

const guidedStudyFlow = ai.defineFlow(
  {
    name: 'guidedStudyFlow',
    inputSchema: GuidedStudyInputSchema,
    outputSchema: GuidedStudyOutputSchema,
  },
  async (input) => {
    try {
      console.log(`Starting guided study session for: ${input.topic}`);
      
      // Step 1: Generate Study Notes
      const notes = await generateStudyNotes({ topic: input.topic, answerLength: '10-mark' });
      
      // Step 2: Generate MCQs based on the same topic
      const mcqs = await generateMCQs({
        topic: input.topic,
        count: 3, // A small number for a quick check
        difficulty: 'medium',
        examType: 'university',
      });
      
      // Step 3: Generate Flashcards for reinforcement
      const flashcards = await generateFlashcards({
        topic: input.topic,
        count: 5, // A few key flashcards
        difficulty: 'medium',
        examType: 'university',
      });

      console.log(`Guided study session for "${input.topic}" generated successfully.`);

      // Step 4: Assemble the final output package
      return {
        topic: input.topic,
        notes,
        mcqs,
        flashcards,
        // We can create a new set of 'nextSteps' for the whole package
        nextSteps: [
          {
            title: "Try a Case Simulation",
            description: `Apply your knowledge of ${input.topic} in an interactive case.`,
            toolId: "cases",
            prefilledTopic: input.topic,
            cta: "Start Case Simulation"
          },
          {
            title: "Visualize the Process",
            description: `Create a flowchart for the management or pathophysiology of ${input.topic}.`,
            toolId: "flowcharts",
            prefilledTopic: input.topic,
            cta: "Create Flowchart"
          }
        ]
      };
    } catch (err) {
      console.error(`[GuidedStudyAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error(`An unexpected error occurred during the guided study session for "${input.topic}". Please try again.`);
    }
  }
);
