// src/app/api/chat/route.ts
import { createApi } from '@genkit-ai/next';
import { chatFlow } from '@/ai/agents/ChatAgent';

export const { POST } = createApi({
  // By default, this will be hosted at `/api/chat`.
  // The name of the flow to expose.
  flow: chatFlow,
  // Enable streaming responses.
  stream: true,
  // Zod schema for the streamed chunks.
  // This must match the stream() argument in your flow.
  // streamSchema: z.string(), // If you were streaming raw strings.
});
