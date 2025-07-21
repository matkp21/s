
'use server';
/**
 * @fileOverview Defines a Genkit flow for handling chat interactions.
 * This flow now supports conversation history and can use tools like symptom analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { symptomAnalyzerTool } from '@/ai/tools/symptom-analyzer-tool';
import { callGeminiApiDirectly } from '@/ai/utils/direct-gemini-call';
import { mcqGeneratorTool, studyNotesGeneratorTool } from '@/ai/tools/medico-tools';

// Define schema for a single message in the history
const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Define input schema for a chat message, now including history
export const ChatMessageInputSchema = z.object({
  message: z.string().describe('The user message in the chat conversation.'),
  history: z.array(HistoryMessageSchema).optional().describe('A history of the conversation so far.'),
});
export type ChatMessageInput = z.infer<typeof ChatMessageInputSchema>;

// The output schema remains a simple string, as we stream the response.
// The full tool output object will be sent as part of the stream's data property.
export const ChatMessageOutputSchema = z.string();
export type ChatMessageOutput = z.infer<typeof ChatMessageOutputSchema>;

// This function is kept for non-streaming scenarios or testing.
export async function processChatMessage(input: ChatMessageInput): Promise<ChatMessageOutput> {
  const { stream, response } = chatFlow.stream(input);
  // For a non-streaming response, we just await the final result.
  await response();
  // The text of the final response is now available on the response object.
  // This is a simplified path; the streaming implementation will be different.
  const finalResponse = await response;
  return finalResponse.output || "I'm sorry, I couldn't process that.";
}

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatMessageInputSchema },
  // The output is now a simple string, as we handle tool outputs via streaming.
  output: { format: 'text' },
  tools: [symptomAnalyzerTool, studyNotesGeneratorTool, mcqGeneratorTool],
  prompt: `You are MediAssistant, a helpful and friendly AI medical assistant.
Your primary goal is to assist users with their medical queries.
Always be empathetic and maintain a professional tone.

Conversation History:
{{#if history}}
  {{#each history}}
    {{role}}: {{{content}}}
  {{/each}}
{{/if}}

User's latest message: {{{message}}}

Instructions:
1.  **Symptom Analysis:** If the user's message clearly describes medical symptoms (e.g., "I have a fever and a cough"), use the 'symptomAnalyzer' tool.
2.  **Study Notes:** If the user asks for notes, an explanation, or details about a medical topic (e.g., "Tell me about diabetes", "/notes on hypertension"), use the 'studyNotesGenerator' tool.
3.  **MCQs:** If the user asks for questions, a quiz, or MCQs (e.g., "give me 5 questions on cardiology", "/mcq Asthma 3"), use the 'mcqGeneratorTool'. Extract both the topic and the number of questions requested.
4.  **General Conversation:** For anything else (greetings, general questions), respond conversationally without using a tool.
5.  **Confirmation:** When a tool is used successfully, respond with a brief confirmation message like "Here are the notes for..." or "I've generated some MCQs for you." The structured tool output will be handled separately by the application.
  `,
  config: {
    temperature: 0.5,
  },
});

export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatMessageInputSchema,
    outputSchema: ChatMessageOutputSchema,
  },
  async (input, streamingCallback) => {
    // The history now comes from the input schema
    const history = input.history?.map((msg) => ({
        role: msg.role,
        content: [{ text: msg.content }],
    }));

    const llmResponse = await ai.generate({
        prompt: {
            ...chatPrompt,
            input,
        },
        history,
        streamingCallback,
    });

    return llmResponse.text();
  }
);
