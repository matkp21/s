
// src/components/chat/chat-thinking-indicator.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeartPulse } from 'lucide-react';

export function ChatThinkingIndicator() {
  return (
    <div className="flex items-end gap-2 fade-in">
      <Avatar className="h-8 w-8 self-start flex-shrink-0">
        <AvatarImage src="/placeholder-bot.jpg" alt="Bot Avatar" data-ai-hint="robot avatar" />
        <AvatarFallback className="bg-gradient-to-br from-sky-500 via-blue-600 to-blue-700 glowing-ring-firebase">
            <HeartPulse className="h-4 w-4 text-white" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-xs lg:max-w-md rounded-xl p-3 shadow-md bg-secondary text-secondary-foreground rounded-bl-none">
        <div className="flex items-center justify-center space-x-1 h-6">
            <HeartPulse className="h-5 w-5 text-primary animate-ecg-beat" />
        </div>
      </div>
    </div>
  );
}
