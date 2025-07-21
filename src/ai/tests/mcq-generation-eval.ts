
'use server';
/**
 * @fileoverview Defines an evaluation flow for the Medico MCQ Generator agent.
 * This flow runs the agent against a predefined set of test cases to measure its quality.
 */

import { ai } from '@/ai/genkit';
import { generateMCQs } from '@/ai/agents/medico/MCQGeneratorAgent';
import { z } from 'zod';
import {
  googleAI,
} from '@genkit-ai/googleai';
import {
  answerRelevancy,
  faithfulness,
} from 'genkit/eval';

// Define the schema for our test cases
const MCQGeneratorTestCaseSchema = z.object({
  topic: z.string(),
  // The 'expected' field provides the ground truth/context for evaluation.
  expected: z.string().describe('A brief description of what a good question should cover.'),
});
type MCQGeneratorTestCase = z.infer<typeof MCQGeneratorTestCaseSchema>;

// Define a dataset of test cases for the MCQ Generator
const mcqGeneratorDataset: MCQGeneratorTestCase[] = [
  {
    topic: 'Myocardial Infarction',
    expected: 'The question should cover the diagnosis, risk factors, or management of a heart attack. The explanation should be medically accurate.',
  },
  {
    topic: 'Pharmacology of Penicillin',
    expected: 'The question should relate to the mechanism of action, side effects, or clinical use of Penicillin antibiotics.',
  },
  {
    topic: 'Krebs Cycle',
    expected: 'The question should test knowledge of the key enzymes, substrates, or products of the citric acid cycle.',
  },
   {
    topic: 'Community-Acquired Pneumonia',
    expected: 'The question should ask about common pathogens, diagnostic criteria, or first-line treatment for community-acquired pneumonia.',
  },
];

// Define the evaluator with specific metrics
const mcqGeneratorEvaluator = ai.defineEvaluator({
  name: 'mcqGeneratorEvaluator',
  metrics: [
    answerRelevancy, // How relevant is the generated question to the topic?
    faithfulness,    // Is the explanation factually consistent with the provided context?
  ],
});

// Define a flow to run the evaluation
export const mcqGenerationEvalRun = ai.defineFlow(
  {
    name: 'mcqGenerationEvalRun',
    inputSchema: z.void(),
    outputSchema: z.any(),
  },
  async () => {
    // Run the MCQ Generator flow on each test case in our dataset
    const evaluationRun = await mcqGeneratorEvaluator.run({
      dataset: mcqGeneratorDataset,
      flow: generateMCQs,
      // Map the test case to the flow's input and context for evaluation
      map: (testCase) => ({
        input: {
          topic: testCase.topic,
          count: 1, // We only need one question for evaluation purposes
          difficulty: 'medium',
          examType: 'university'
        },
        context: [
          // Provide the expected outcome as context for the faithfulness and relevancy metrics
          testCase.expected,
        ],
        // Provide the generated question and explanation as the output to be evaluated
        output: (flowOutput) => {
            const firstMcq = flowOutput?.mcqs?.[0];
            return firstMcq ? `Question: ${firstMcq.question} Explanation: ${firstMcq.explanation}` : "No MCQ provided";
        }
      }),
    });

    // You can view the results of this 'evaluationRun' in the Genkit Inspector UI.
    return {
      testCaseCount: mcqGeneratorDataset.length,
      evaluationRun,
    };
  }
);
