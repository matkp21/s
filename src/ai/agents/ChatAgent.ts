
'use server';
/**
 * @fileOverview Defines a Genkit flow for handling chat interactions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { symptomAnalyzerTool } from '@/ai/tools/symptom-analyzer-tool';
import { studyNotesTool, mcqGeneratorTool } from '@/ai/tools/medico-tools';
import { callGeminiApiDirectly } from '@/ai/utils/direct-gemini-call';

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
  } catch (genkitError: any) {
    console.warn("Genkit chatFlow failed, attempting direct Gemini API call as fallback:", genkitError.message || genkitError);
    try {
      const directPrompt = `You are MediAssistant, a helpful and friendly AI medical assistant. The user says: "${input.message}". Respond conversationally and helpfully.`;
      const fallbackResponseText = await callGeminiApiDirectly(directPrompt);
      return { response: fallbackResponseText };
    } catch (fallbackError: any) {
      console.error("Direct Gemini API call (fallback) also failed:", fallbackError.message || fallbackError);
      return { response: "I'm currently experiencing technical difficulties. Please try again later." };
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
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
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

      const finalResponse = await ai.generate({
        model: 'googleai/gemini-1.5-pro',
        prompt: `Based on the user's message "${input.message}" and the result from the tool "${toolCall.name}", which is: ${JSON.stringify(toolResponse)}, formulate a user-facing response. Present the data clearly and conversationally.`,
      });
      output.response = finalResponse.text;
    }
    
    return output;
  }
);
