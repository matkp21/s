import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {vertexAI} from '@genkit-ai/vertexai';

export const ai = genkit({
  plugins: [googleAI(), vertexAI()],
  model: 'googleai/gemini-3-pro-preview',
});
