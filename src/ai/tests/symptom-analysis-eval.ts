
'use server';
/**
 * @fileoverview Defines an evaluation flow for the symptom analyzer agent.
 * This flow runs the agent against a predefined set of test cases to measure its quality.
 */

import { ai } from '@/ai/genkit';
import { symptomAnalyzerFlow } from '@/ai/agents/SymptomAnalyzerAgent';
import { z } from 'zod';
import {
  googleAI,
  geminiPro,
} from '@genkit-ai/googleai';
import {
  answerRelevancy,
  faithfulness,
  EvaluationMetric,
} from 'genkit/eval';

// Define the schema for our test cases
const SymptomAnalysisTestCaseSchema = z.object({
  symptoms: z.string(),
  patientContext: z
    .object({
      age: z.number().optional(),
      sex: z.enum(['male', 'female', 'other']).optional(),
      history: z.string().optional(),
    })
    .optional(),
  // The 'expected' field provides the ground truth for evaluation.
  expected: z.string().describe('The expected primary diagnosis or key consideration.'),
});
type SymptomAnalysisTestCase = z.infer<typeof SymptomAnalysisTestCaseSchema>;

// Define a dataset of test cases
const symptomAnalysisDataset: SymptomAnalysisTestCase[] = [
  {
    symptoms: 'Sudden onset of crushing chest pain radiating to the left arm, shortness of breath, and sweating.',
    patientContext: { age: 55, sex: 'male', history: 'Smoker, hypertensive' },
    expected: 'Acute Myocardial Infarction',
  },
  {
    symptoms: 'Fever, cough with yellow sputum, and pleuritic chest pain for 3 days.',
    patientContext: { age: 65 },
    expected: 'Community-Acquired Pneumonia',
  },
  {
    symptoms: 'Right lower quadrant abdominal pain, started periumbilically, associated with anorexia and low-grade fever.',
    patientContext: { age: 22 },
    expected: 'Acute Appendicitis',
  },
   {
    symptoms: 'Polyuria, polydipsia, and unexplained weight loss over the past month.',
    patientContext: { age: 45, history: 'Family history of diabetes' },
    expected: 'Type 2 Diabetes Mellitus',
  },
];

// Define the evaluator with specific metrics
const symptomAnalysisEvaluator = ai.defineEvaluator({
  name: 'symptomAnalysisEvaluator',
  metrics: [
    answerRelevancy, // How relevant is the AI's diagnosis list to the expected diagnosis?
    faithfulness,    // Does the AI's rationale support its suggested diagnoses?
  ],
});

// Define a flow to run the evaluation
export const symptomAnalysisEvalRun = ai.defineFlow(
  {
    name: 'symptomAnalysisEvalRun',
    inputSchema: z.void(),
    outputSchema: z.any(),
  },
  async () => {
    // Run the symptom analyzer flow on each test case in our dataset
    const evaluationRun = await symptomAnalysisEvaluator.run({
      dataset: symptomAnalysisDataset,
      flow: symptomAnalyzerFlow,
      // Map the test case to the flow's input and context for evaluation
      map: (testCase) => ({
        input: {
          symptoms: testCase.symptoms,
          patientContext: testCase.patientContext,
        },
        context: [
          // Provide the expected outcome as context for the faithfulness metric
          `The patient presented with: ${testCase.symptoms}. The expected primary consideration is ${testCase.expected}.`,
        ],
        // Provide the generated diagnoses as the output to be evaluated
        output: (flowOutput) => flowOutput?.diagnoses[0]?.name || "No diagnosis provided",
      }),
    });

    // You can view the results of this 'evaluationRun' in the Genkit Inspector UI.
    return {
      testCaseCount: symptomAnalysisDataset.length,
      evaluationRun,
    };
  }
);
