// src/ai/retrievers/smart-search-retriever.ts
'use server';
/**
 * @fileOverview Defines the RAG pipeline for the Smart Search tool.
 * This includes setting up the indexer and retriever for the medical knowledge base.
 */
import { ai } from '@/ai/genkit';
import { googleAI, GoogleAIVectorStore } from '@genkit-ai/googleai';
import { text } from 'genkit/content';

// Define the source of our documents
const documentSources = [
  'src/ai/retrievers/data/heart-failure.md',
  'src/ai/retrievers/data/diabetes.md',
];

// Define our in-memory vector store using Google AI
export const smartSearchStore = new GoogleAIVectorStore({
  model: 'text-embedding-004',
});

// Define the indexer
export const smartSearchIndexer = googleAI.indexer({
  // Genkit will manage the vector store (uploads, etc.) under this name
  indexId: 'medico-smart-search',
  // You can specify the store explicitly or Genkit can create a default
  store: smartSearchStore,
});

// Define the retriever
export const smartSearchRetriever = googleAI.retriever({
  // An arbitrary name for the retriever
  name: 'smartSearchRetriever',
  // The store to retrieve from
  store: smartSearchStore,
});

// Helper function to run the indexing process
// In a real app, this might be triggered by a build step or a webhook when documents change.
export async function runIndexer() {
  console.log('Starting Medico Smart Search indexing...');
  try {
    const documents = await Promise.all(
      documentSources.map((source) => text({ source }))
    );
    await smartSearchIndexer.index({ documents });
    console.log('Indexing complete.');
    return { success: true, message: 'Indexing complete.' };
  } catch (error) {
    console.error('Indexing failed:', error);
    return { success: false, message: 'Indexing failed.' };
  }
}
