'use server';
/**
 * @fileOverview Defines a Genkit flow for handling chat interactions.
 * This flow can respond to general conversation and use tools like symptom analysis.
 *
 * - chatFlow - The main flow for chat.
 * - ChatMessageInput - Input type for user messages.
 * - ChatMessageOutput - Output type for bot responses.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {z} from 'genkit';
import { symptomAnalyzerTool } from '@/ai/tools/symptom-analyzer-tool';
import { studyNotesTool, mcqGeneratorTool } from '@/ai/tools/medico-tools';
import { callGeminiApiDirectly } from '@/ai/utils/direct-gemini-call';
import { generate } from 'genkit/ai';

// Define input schema for a chat message
const ChatMessageInputSchema = z.object({
  message: z.string().describe('The user message in the chat conversation.'),
  // Future: Add conversation history, user ID, etc.
});
export type ChatMessageInput = z.infer<typeof ChatMessageInputSchema>;

// Define output schema for a chat message response
const ChatMessageOutputSchema = z.object({
  response: z.string().describe('The AI assistant s response to the user message.'),
  toolResponse: z.any().optional().describe('Structured output from any tool that was called.'),
  toolName: z.string().optional().describe('The name of the tool that was called.'),
});
export type ChatMessageOutput = z.infer<typeof ChatMessageOutputSchema>;


export async function processChatMessage(input: ChatMessageInput): Promise<ChatMessageOutput> {
  try {
    // Try Genkit flow first
    const genkitResponse = await chatFlow(input);
    return genkitResponse;
  } catch (genkitError: any) {
    console.warn("Genkit chatFlow failed, attempting direct Gemini API call as fallback:", genkitError.message || genkitError);
    try {
      // Construct a simplified prompt for the direct call.
      // This fallback will NOT use tools like symptomAnalyzerTool or the full context of the original chatPrompt.
      const directPrompt = `You are MediAssistant, a helpful and friendly AI medical assistant. The user says: "${input.message}". Respond conversationally and helpfully.`;
      const fallbackResponseText = await callGeminiApiDirectly(directPrompt);
      return { response: fallbackResponseText };
    } catch (fallbackError: any) {
      console.error("Direct Gemini API call (fallback) also failed:", fallbackError.message || fallbackError);
      // Return a generic error if both fail
      return { response: "I'm currently experiencing technical difficulties and cannot process your request. Please try again later." };
    }
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
      model: googleAI('gemini-1.5-pro-preview'),
      prompt: input.message,
      tools: [symptomAnalyzerTool, studyNotesTool, mcqGeneratorTool],
      config: {
        temperature: 0.5,
      },
    });

    const outputText = llmResponse.text();
    const toolCalls = llmResponse.toolCalls();
    
    // Default response if no tool is called.
    const output: ChatMessageOutput = { response: outputText };

    if (toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      const toolResponse = await toolCall.run();

      output.toolResponse = toolResponse;
      output.toolName = toolCall.name;

      // Generate a final response based on the tool's output
      const finalResponse = await generate({
        model: googleAI('gemini-1.5-pro-preview'),
        prompt: `Based on the user's message "${input.message}" and the result from the tool "${toolCall.name}", which is: ${JSON.stringify(toolResponse)}, formulate a user-facing response. Present the data clearly and conversationally.`,
      });
      output.response = finalResponse.text();
    }
    
    if (!output.response) {
       throw new Error("Genkit flow did not produce a text output.");
    }
    
    return output;
  }
);
