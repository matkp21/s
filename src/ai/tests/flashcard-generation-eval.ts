
'use server';
/**
 * @fileoverview Defines an evaluation flow for the Medico Flashcard Generator agent.
 */

import { ai } from '@/ai/genkit';
import { generateFlashcards } from '@/ai/agents/medico/FlashcardGeneratorAgent';
import { z } from 'zod';
import {
  answerRelevancy,
  faithfulness,
} from 'genkit/eval';

// Define the schema for our test cases
const FlashcardGeneratorTestCaseSchema = z.object({
  topic: z.string(),
  // The 'expected' field provides the ground truth/context for evaluation.
  expected: z.string().describe('A brief description of what a good flashcard should cover.'),
});
type FlashcardGeneratorTestCase = z.infer<typeof FlashcardGeneratorTestCaseSchema>;

// Define a dataset of test cases for the Flashcard Generator
const flashcardGeneratorDataset: FlashcardGeneratorTestCase[] = [
  {
    topic: 'Anatomy of the Heart',
    expected: 'The flashcards should cover the four chambers, major vessels, and valves of the heart.',
  },
  {
    topic: 'Side effects of Metformin',
    expected: 'The flashcards should mention common side effects like GI upset and the rare but serious side effect of lactic acidosis.',
  },
  {
    topic: 'Gram-positive vs Gram-negative bacteria',
    expected: 'The flashcards should highlight key differences in the cell wall structure, such as peptidoglycan layer thickness and the presence of an outer membrane.',
  },
];

// Define the evaluator with specific metrics
const flashcardGeneratorEvaluator = ai.defineEvaluator({
  name: 'flashcardGeneratorEvaluator',
  metrics: [
    answerRelevancy, // How relevant is the generated flashcard to the topic?
    faithfulness,    // Is the flashcard factually consistent with the expected context?
  ],
});

// Define a flow to run the evaluation
export const flashcardGenerationEvalRun = ai.defineFlow(
  {
    name: 'flashcardGenerationEvalRun',
    inputSchema: z.void(),
    outputSchema: z.any(),
  },
  async () => {
    // Run the Flashcard Generator flow on each test case in our dataset
    const evaluationRun = await flashcardGeneratorEvaluator.run({
      dataset: flashcardGeneratorDataset,
      flow: generateFlashcards,
      // Map the test case to the flow's input and context for evaluation
      map: (testCase) => ({
        input: {
          topic: testCase.topic,
          count: 1, // Evaluate one card for simplicity
          difficulty: 'medium',
          examType: 'university'
        },
        context: [
          // Provide the expected outcome as context for the faithfulness and relevancy metrics
          testCase.expected,
        ],
        // Provide the generated flashcard front/back as the output to be evaluated
        output: (flowOutput) => {
            const firstCard = flowOutput?.flashcards?.[0];
            return firstCard ? `Front: ${firstCard.front} - Back: ${firstCard.back}` : "No flashcard provided";
        }
      }),
    });

    // You can view the results of this 'evaluationRun' in the Genkit Inspector UI.
    return {
      testCaseCount: flashcardGeneratorDataset.length,
      evaluationRun,
    };
  }
);
