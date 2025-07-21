// src/ai/agents/ChatAgent.ts
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
import {z} from 'genkit';
import { symptomAnalyzerTool } from '@/ai/tools/symptom-analyzer-tool';
import { studyNotesTool, mcqGeneratorTool } from '@/ai/tools/medico-tools';
import { callGeminiApiDirectly } from '@/ai/utils/direct-gemini-call';

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
      // This fallback will NOT use tools or the full context of the original chatPrompt.
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

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatMessageInputSchema },
  output: { schema: ChatMessageOutputSchema },
  tools: [symptomAnalyzerTool, studyNotesTool, mcqGeneratorTool],
  prompt: `You are MediAssistant, a helpful and friendly AI medical assistant.
  Your primary goal is to assist users with their medical queries.

  User's message: {{{message}}}

  Instructions:
  1. If the user's message clearly describes medical symptoms they are experiencing (e.g., "I have a fever and a cough", "My symptoms are headache and nausea"), use the 'symptomAnalyzer' tool to analyze these symptoms.
     - When presenting the results, clearly state that these are potential considerations and not a diagnosis, and advise consulting a medical professional.
     - Format the potential diagnoses from the tool in a clear, readable way (e.g., a list).
  2. If the user's message is a command for a medico tool, use the appropriate tool.
     - For "/notes <topic>", use the 'generateStudyNotes' tool.
     - For "/mcq <topic> [count]", use the 'generateMCQs' tool, extracting the topic and optional count.
  3. If the user's message is a general question, a greeting, or anything not describing specific medical symptoms for analysis or a medico command, respond conversationally and helpfully without using a tool.
  4. Be empathetic and maintain a professional tone.
  5. If a tool returns no specific results, inform the user that no specific information could be determined based on the input.
  `,
  config: {
    temperature: 0.5, 
  }
});


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatMessageInputSchema,
    outputSchema: ChatMessageOutputSchema,
  },
  async (input) => {
    const llmResponse = await chatPrompt(input);
    const output = llmResponse.output();
    
    if (!output) {
      throw new Error("Genkit flow did not produce an output.");
    }
    
    // Check if a tool was used and include its output and name in the response
    const toolRequest = llmResponse.history[llmResponse.history.length - 2];
    if (toolRequest?.role === 'model' && toolRequest.content[0].toolRequest) {
        const toolResponse = llmResponse.history[llmResponse.history.length - 1];
        if (toolResponse?.role === 'tool' && toolResponse.content[0].toolResponse) {
             output.toolName = toolRequest.content[0].toolRequest.name;
             output.toolResponse = toolResponse.content[0].toolResponse.output;
        }
    }
    
    return output;
  }
);
