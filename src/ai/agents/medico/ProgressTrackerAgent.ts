// src/ai/agents/medico/ProgressTrackerAgent.ts
'use server';
/**
 * @fileOverview A Genkit flow for tracking study progress for medico users.
 * This is a conceptual agent that would typically interact with a database.
 *
 * - trackProgress - A function that handles progress tracking.
 * - MedicoProgressTrackerInput - The input type.
 * - MedicoProgressTrackerOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { MedicoProgressTrackerInputSchema, MedicoProgressTrackerOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoProgressTrackerInput = z.infer<typeof MedicoProgressTrackerInputSchema>;
export type MedicoProgressTrackerOutput = z.infer<typeof MedicoProgressTrackerOutputSchema>;

export async function trackProgress(input: MedicoProgressTrackerInput): Promise<MedicoProgressTrackerOutput> {
  // In a real application, this function would read from and write to a Firestore database
  // to get the user's current progress and update it.
  // For this conceptual agent, we'll simulate this interaction within the prompt.
  return progressTrackerFlow(input);
}

const progressTrackerPrompt = ai.definePrompt({
  name: 'medicoProgressTrackerPrompt',
  input: { schema: MedicoProgressTrackerInputSchema },
  output: { schema: MedicoProgressTrackerOutputSchema },
  prompt: `You are an AI assistant that provides gamified feedback for a medical student's study progress.
Your primary task is to generate a JSON object containing an encouraging progress update message based on a completed activity AND a list of relevant, intelligent next study steps.

The JSON object you generate MUST have 'progressUpdateMessage', 'newAchievements', 'updatedTopicProgress', and a 'nextSteps' field.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant, actionable suggestions.

---

**Instructions for Agentic Feedback:**
Analyze the student's performance on the completed activity and provide tailored suggestions.

**Activity Details:**
- Activity Type: {{{activityType}}}
- Topic: {{{topic}}}
{{#if score}}- Score: {{{score}}}%{{/if}}

1.  **'progressUpdateMessage'**: Provide an encouraging message reflecting their performance.
2.  **'newAchievements'**: If the score is high (e.g., > 85%), award a conceptual achievement in this array (e.g., "Cardiology Whiz", "Pharmacology Pro"). If no new achievement, return an empty array.
3.  **'updatedTopicProgress'**: Calculate a new conceptual progress percentage for the topic in this object, assuming they started at a lower percentage.
4.  **'nextSteps' (Agentic Logic):**
    -   **If the score is low (e.g., < 60%)**: Suggest foundational tools. The primary suggestion should be to use the 'notes-generator' to review the topic thoroughly. The secondary suggestion could be to create 'flashcards'.
    -   **If the score is good (e.g., >= 60%)**: Suggest more advanced or related actions. The primary suggestion could be to apply the knowledge in a 'cases' simulation. The secondary could be to explore a related topic or try a harder quiz.
    -   **If there is no score (e.g., 'notes_review')**: Suggest testing the knowledge with 'mcq' or 'flashcards'.

Example for 'nextSteps' on a poor quiz score:
[
  {
    "title": "Review Core Concepts",
    "description": "Generate structured notes for {{{topic}}} to build a stronger foundation.",
    "toolId": "notes-generator",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Review Study Notes"
  },
  {
    "title": "Reinforce with Flashcards",
    "description": "Create flashcards for the key points of {{{topic}}}.",
    "toolId": "flashcards",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Create Flashcards"
  }
]

Format the entire output as JSON conforming to the MedicoProgressTrackerOutputSchema.
`,
  config: {
    temperature: 0.7, // More creative for gamified messages
  }
});

const progressTrackerFlow = ai.defineFlow(
  {
    name: 'medicoProgressTrackerFlow',
    inputSchema: MedicoProgressTrackerInputSchema,
    outputSchema: MedicoProgressTrackerOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await progressTrackerPrompt(input);

      if (!output || !output.progressUpdateMessage) {
        console.error('MedicoProgressTrackerPrompt did not return a valid progress update for:', input);
        throw new Error('Failed to track progress. The AI model did not return the expected output.');
      }
      // In a real app, you would now use this output to update Firestore.
      // e.g., db.collection('user_progress').doc(userId).update({ ... });
      return output;
    } catch (err) {
      console.error(`[ProgressTrackerAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while tracking progress. Please try again.');
    }
  }
);
