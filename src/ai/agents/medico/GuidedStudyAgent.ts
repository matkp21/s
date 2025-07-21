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
      
      // Run all agent calls in parallel for efficiency
      const [notesResult, mcqsResult, flashcardsResult] = await Promise.allSettled([
        generateStudyNotes({
          topic: input.topic,
          answerLength: '10-mark',
        }),
        generateMCQs({
          topic: input.topic,
          count: 3, // A small number for a quick check
          difficulty: 'medium',
          examType: 'university',
        }),
        generateFlashcards({
          topic: input.topic,
          count: 5, // A few key flashcards
          difficulty: 'medium',
          examType: 'university',
        }),
      ]);

      // Process results, handling potential failures gracefully
      const studyNotes = notesResult.status === 'fulfilled' ? notesResult.value : null;
      const mcqs = mcqsResult.status === 'fulfilled' ? mcqsResult.value : null;
      const flashcards = flashcardsResult.status === 'fulfilled' ? flashcardsResult.value : null;
      
      if (notesResult.status === 'rejected') console.error("Notes generation failed:", notesResult.reason);
      if (mcqsResult.status === 'rejected') console.error("MCQ generation failed:", mcqsResult.reason);
      if (flashcardsResult.status === 'rejected') console.error("Flashcards generation failed:", flashcardsResult.reason);

      if (!studyNotes || !mcqs || !flashcards) {
        throw new Error("One or more sub-agents failed to generate content for the comprehensive review.");
      }

      console.log(`Guided study session for "${input.topic}" generated successfully.`);

      // Assemble the final output package
      return {
        topic: input.topic,
        notes: studyNotes,
        mcqs,
        flashcards,
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
