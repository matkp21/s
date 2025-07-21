// src/ai/agents/medico/VideoSummarizerAgent.ts
'use server';
/**
 * @fileOverview A Genkit flow for summarizing YouTube videos.
 *
 * This agent takes a YouTube video ID, fetches its transcript, and uses
 * an LLM to generate a concise summary of the content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { YoutubeTranscript } from 'youtube-transcript';
import { generate } from 'genkit/ai';

// Input schema for the summarizer flow
export const VideoSummarizerInputSchema = z.object({
  videoId: z.string().describe("The ID of the YouTube video to summarize."),
});
export type VideoSummarizerInput = z.infer<typeof VideoSummarizerInputSchema>;

// Output schema for the summarizer flow
export const VideoSummarizerOutputSchema = z.object({
  summary: z.string().describe("The generated text summary of the video transcript."),
});
export type VideoSummarizerOutput = z.infer<typeof VideoSummarizerOutputSchema>;


// Exported function to be called from the frontend
export async function summarizeVideo(input: VideoSummarizerInput): Promise<VideoSummarizerOutput> {
  return videoSummarizerFlow(input);
}


// Internal tool to fetch the transcript
const fetchTranscriptTool = ai.defineTool(
  {
    name: 'fetchTranscript',
    description: 'Fetches the transcript for a given YouTube video ID.',
    inputSchema: z.string(), // Input is the video ID
    outputSchema: z.string(), // Output is the transcript text
  },
  async (videoId) => {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      // Join the transcript parts into a single string
      return transcript.map(part => part.text).join(' ');
    } catch (error) {
      console.error(`Failed to fetch transcript for video ID ${videoId}:`, error);
      throw new Error(`Could not fetch transcript. The video may not have one available or may have disabled it.`);
    }
  }
);


// Genkit flow that orchestrates the summarization
const videoSummarizerFlow = ai.defineFlow(
  {
    name: 'videoSummarizerFlow',
    inputSchema: VideoSummarizerInputSchema,
    outputSchema: VideoSummarizerOutputSchema,
  },
  async (input) => {
    try {
      // Step 1: Fetch the transcript using our tool
      const transcript = await fetchTranscriptTool(input.videoId);

      if (!transcript || transcript.length < 100) {
        return { summary: "Could not generate a summary. The video transcript is too short or unavailable." };
      }

      // Step 2: Use the fetched transcript to generate a summary with an LLM
      const summaryPrompt = `Summarize the following medical video transcript into key learning points. Focus on definitions, mechanisms, clinical features, and management. Format the output using Markdown with headings and bullet points for clarity.

Transcript:
"""
${transcript.substring(0, 30000)}
"""

Summary:`;
      
      const { text } = await generate({
        prompt: summaryPrompt,
        model: 'googleai/gemini-pro',
        config: {
          temperature: 0.2, // Lower temperature for factual summarization
        },
      });
      const summaryText = text();
      if (!summaryText) {
        throw new Error("AI failed to generate a summary for the provided transcript.");
      }

      return { summary: summaryText };
    } catch (err) {
      console.error(`[VideoSummarizerAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error(`An unexpected error occurred while summarizing the video. Please try again.`);
    }
  }
);
