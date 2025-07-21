
// src/components/chat/chat-commands.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useProMode } from "@/contexts/pro-mode-context";
import { BookOpen, FileQuestion } from "lucide-react";
import React from 'react';

interface ChatCommandsProps {
  onSendMessage: (command: string) => void;
}

export function ChatCommands({ onSendMessage }: ChatCommandsProps) {
  const { userRole } = useProMode();

  if (userRole !== 'medico') {
    return null; // Only show commands for medico users
  }

  const commands = [
    { label: "Generate Notes", command: "/notes ", icon: BookOpen },
    { label: "Generate MCQs", command: "/mcq ", icon: FileQuestion },
  ];

  return (
    <div className="mb-2 flex items-center gap-2 flex-wrap">
       <p className="text-xs text-muted-foreground font-medium mr-2">Try commands:</p>
      {commands.map((cmd) => (
        <Button
          key={cmd.label}
          variant="outline"
          size="xs"
          className="text-xs rounded-full"
          // We can't directly pre-fill the input, so this is a placeholder.
          // A full implementation might use a state management library.
          // For now, let's just log it or provide a template.
          onClick={() => onSendMessage(cmd.command + "Cardiology")}
        >
          <cmd.icon className="mr-1.5 h-3.5 w-3.5" />
          {cmd.command}...
        </Button>
      ))}
    </div>
  );
}
