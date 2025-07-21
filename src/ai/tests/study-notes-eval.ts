
'use server';
/**
 * @fileoverview Defines an evaluation flow for the Medico Study Notes Generator agent.
 */

import { ai } from '@/ai/genkit';
import { generateStudyNotes } from '@/ai/agents/medico/StudyNotesAgent';
import { z } from 'zod';
import {
  answerRelevancy,
  faithfulness,
} from 'genkit/eval';

// Define the schema for our test cases
const StudyNotesTestCaseSchema = z.object({
  topic: z.string(),
  // The 'expected' field provides the ground truth/context for evaluation.
  expected: z.string().describe('A brief description of what the generated notes should cover.'),
});
type StudyNotesTestCase = z.infer<typeof StudyNotesTestCaseSchema>;

// Define a dataset of test cases
const studyNotesDataset: StudyNotesTestCase[] = [
  {
    topic: 'Management of Hypertension',
    expected: 'The notes should cover lifestyle modifications, and first-line pharmacological agents like ACE inhibitors, ARBs, CCBs, and diuretics.',
  },
  {
    topic: 'Pathophysiology of Type 2 Diabetes',
    expected: 'The notes must mention insulin resistance and relative insulin deficiency as the core pathophysiological defects.',
  },
  {
    topic: 'Cranial Nerves',
    expected: 'The generated notes should list the 12 cranial nerves and their primary functions.',
  },
];

// Define the evaluator with specific metrics
const studyNotesEvaluator = ai.defineEvaluator({
  name: 'studyNotesEvaluator',
  metrics: [
    answerRelevancy, // How relevant are the notes to the topic?
    faithfulness,    // Is the note content factually consistent with the expected context?
  ],
});

// Define a flow to run the evaluation
export const studyNotesEvalRun = ai.defineFlow(
  {
    name: 'studyNotesEvalRun',
    inputSchema: z.void(),
    outputSchema: z.any(),
  },
  async () => {
    // Run the Study Notes Generator flow on each test case
    const evaluationRun = await studyNotesEvaluator.run({
      dataset: studyNotesDataset,
      flow: generateStudyNotes,
      map: (testCase) => ({
        input: {
          topic: testCase.topic,
          answerLength: '5-mark', // Use a shorter length for faster evaluation
        },
        context: [testCase.expected],
        output: (flowOutput) => flowOutput?.notes || "No notes provided",
      }),
    });

    // You can view the results in the Genkit Inspector UI.
    return {
      testCaseCount: studyNotesDataset.length,
      evaluationRun,
    };
  }
);
