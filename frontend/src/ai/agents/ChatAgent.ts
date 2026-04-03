'use server';
/**
 * @fileOverview Defines a Genkit flow for handling chat interactions.
 * Standardized to gemini-3-pro-preview for advanced reasoning.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { symptomAnalyzerTool } from '@/ai/tools/symptom-analyzer-tool';
import { studyNotesTool, mcqGeneratorTool } from '@/ai/tools/medico-tools';
import { callGeminiApiDirectly } from '@/ai/utils/direct-gemini-call';
import { generate } from 'genkit/ai';

const ChatMessageInputSchema = z.object({
  message: z.string().describe('The user message in the chat conversation.'),
});
export type ChatMessageInput = z.infer<typeof ChatMessageInputSchema>;

const ChatMessageOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user message.'),
  toolResponse: z.any().optional().describe('Structured output from any tool that was called.'),
  toolName: z.string().optional().describe('The name of the tool that was called.'),
});
export type ChatMessageOutput = z.infer<typeof ChatMessageOutputSchema>;

export async function processChatMessage(input: ChatMessageInput): Promise<ChatMessageOutput> {
  try {
    return chatFlow(input);
  } catch (error: any) {
    console.warn("Genkit chatFlow failed, attempting direct Gemini API call as fallback:", error.message);
    const directPrompt = `You are MediAssistant, a helpful and friendly AI medical assistant. The user says: "${input.message}". Respond conversationally and helpfully.`;
    const fallbackResponseText = await callGeminiApiDirectly(directPrompt);
    return { response: fallbackResponseText };
  }
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatMessageInputSchema,
    outputSchema: ChatMessageOutputSchema,
  },
  async (input) => {
    const llmResponse = await generate({
      model: 'googleai/gemini-3-pro-preview',
      prompt: input.message,
      tools: [symptomAnalyzerTool, studyNotesTool, mcqGeneratorTool],
      config: {
        temperature: 0.5,
      },
    });

    const outputText = llmResponse.text;
    const toolCalls = llmResponse.toolCalls;
    
    const output: ChatMessageOutput = { response: outputText };

    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      const toolResponse = await toolCall.run();

      output.toolResponse = toolResponse;
      output.toolName = toolCall.name;

      const finalResponse = await generate({
        model: 'googleai/gemini-2.5-flash-preview',
        prompt: `Based on the user's message "${input.message}" and the result from the tool "${toolCall.name}", which is: ${JSON.stringify(toolResponse)}, formulate a user-facing response. Present the data clearly and conversationally.`,
      });
      output.response = finalResponse.text;
    }
    
    return output;
  }
);
