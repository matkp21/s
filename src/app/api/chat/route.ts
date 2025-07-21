// src/app/api/chat/route.ts
import {NextResponse} from 'next/server';
import { processChatMessage, type ChatMessageInput } from '@/ai/agents/ChatAgent';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body as ChatMessageInput;
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    const result = await processChatMessage({ message });
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('[Chat API Error]', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
