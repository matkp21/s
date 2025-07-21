
// src/ai/agents/medico/ComprehensiveTopicReviewAgent.ts
'use server';
/**
 * @fileOverview A multi-agent system for a comprehensive topic review.
 * This agent orchestrates other agents to create a full study package.
 */

import { ai } from '@/ai/genkit';
import { generateMCQs } from '@/ai/agents/medico/MCQGeneratorAgent';
import { generateStudyNotes } from '@/ai/agents/medico/MbbsStudyAgent';
import { createFlowchart } from '@/ai/agents/medico/FlowchartCreatorAgent';
import {
  ComprehensiveReviewInputSchema,
  ComprehensiveReviewOutputSchema,
  type ComprehensiveReviewInput,
  type ComprehensiveReviewOutput,
} from '@/ai/schemas/medico-tools-schemas';

export async function getComprehensiveReview(
  input: ComprehensiveReviewInput
): Promise<ComprehensiveReviewOutput> {
  return comprehensiveReviewFlow(input);
}

const comprehensiveReviewFlow = ai.defineFlow(
  {
    name: 'comprehensiveReviewFlow',
    inputSchema: ComprehensiveReviewInputSchema,
    outputSchema: ComprehensiveReviewOutputSchema,
  },
  async (input) => {
    try {
      // Run all agent calls in parallel for efficiency
      const [notesResult, mcqsResult, flowchartResult] = await Promise.allSettled([
        generateStudyNotes({
          topic: input.topic,
          subject: 'General Medicine', // Using a sensible default
        }),
        generateMCQs({
          topic: input.topic,
          count: 5, // Default number of questions
          difficulty: 'medium',
          examType: 'university',
        }),
        createFlowchart({
          topic: `Clinical pathway for ${input.topic}`,
        }),
      ]);

      // Process results, handling potential failures gracefully
      const studyNotes = notesResult.status === 'fulfilled' ? notesResult.value : undefined;
      const mcqs = mcqsResult.status === 'fulfilled' ? mcqsResult.value : undefined;
      const flowchart = flowchartResult.status === 'fulfilled' ? flowchartResult.value : undefined;
      
      if (notesResult.status === 'rejected') console.error("Notes generation failed:", notesResult.reason);
      if (mcqsResult.status === 'rejected') console.error("MCQ generation failed:", mcqsResult.reason);
      if (flowchartResult.status === 'rejected') console.error("Flowchart generation failed:", flowchartResult.reason);

      if (!studyNotes && !mcqs && !flowchart) {
        throw new Error("All sub-agents failed to generate content for the comprehensive review.");
      }

      return {
        topic: input.topic,
        studyNotes,
        mcqs,
        flowchart,
      };
    } catch (err) {
      console.error(`[ComprehensiveReviewAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating the comprehensive review. Please try again.');
    }
  }
);
