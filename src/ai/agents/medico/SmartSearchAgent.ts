// src/ai/agents/medico/SmartSearchAgent.ts
'use server';
/**
 * @fileOverview A RAG agent that uses a vector store of medical documents to answer questions.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { smartSearchRetriever } from '@/ai/retrievers/smart-search-retriever';
import { generate } from 'genkit/ai';

// Input schema for the search query
const SmartSearchInputSchema = z.object({
  query: z.string().describe("The user's question about a medical topic."),
});
type SmartSearchInput = z.infer<typeof SmartSearchInputSchema>;

// Output schema for the answer
const SmartSearchOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer, grounded in the provided context.'),
  sources: z.array(z.string()).describe('A list of the document sources used to generate the answer.'),
});
type SmartSearchOutput = z.infer<typeof SmartSearchOutputSchema>;

// Export the types for use in the UI component
export type { SmartSearchInput, SmartSearchOutput };

// The main exported function that will be called from the frontend.
export async function searchAndSummarize(input: SmartSearchInput): Promise<SmartSearchOutput> {
  return smartSearchFlow(input);
}

// Define the Genkit flow for the RAG process
const smartSearchFlow = ai.defineFlow(
  {
    name: 'smartSearchFlow',
    inputSchema: SmartSearchInputSchema,
    outputSchema: SmartSearchOutputSchema,
  },
  async (input) => {
    // Step 1: Retrieve relevant documents from our vector store
    const searchResult = await smartSearchRetriever.retrieve(input.query);
    const context = searchResult.map((d) => d.text());

    // Step 2: Generate an answer using the retrieved documents as context
    const llmResponse = await generate({
      prompt: `You are a medical education assistant. Answer the user's question based *only* on the provided context. If the context does not contain the answer, state that you cannot answer from the provided documents.

      Question:
      ${input.query}

      Context:
      ${context.join('\n---\n')}
      `,
      model: 'googleai/gemini-1.5-flash',
      config: {
        temperature: 0.1, // Low temperature for fact-based answering
      },
    });

    const sources = searchResult.map(d => d.metadata?.source || 'Unknown');

    return {
      answer: llmResponse.text(),
      sources: [...new Set(sources)], // Return unique source filenames
    };
  }
);
