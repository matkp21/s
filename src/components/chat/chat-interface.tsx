// src/components/chat/chat-interface.tsx
"use client";

import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizonal, Mic, MicOff, Volume2, VolumeX, ArrowDownCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useProMode } from '@/contexts/pro-mode-context';
import { ChatMessage, type Message } from './chat-message';
import { ChatThinkingIndicator } from './chat-thinking-indicator';
import type { SymptomAnalyzerOutput } from '@/ai/agents/SymptomAnalyzerAgent';
import type { MedicoMCQGeneratorOutput } from '@/ai/agents/medico/MCQGeneratorAgent';
import { SymptomAnalysisResultCard } from './symptom-analysis-result-card';
import { ChatCommands } from './chat-commands';
import { MCQResultCard } from './mcq-result-card';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { userRole } = useProMode();

  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[event.results.length - 1][0].transcript.trim();
          setInputValue(transcript);
          handleSendMessage(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          toast({
            variant: 'destructive',
            title: 'Voice Input Error',
            description: `Could not recognize speech: ${event.error}`,
          });
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
           setIsListening(false);
        };
      }
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, [toast]);

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && text && isVoiceOutputEnabled) {
      speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      const welcomeText = "Welcome to MediAssistant Chat! How can I help you today?";
      const welcomeMessage: Message = {
        id: `welcome-bot-${Date.now()}`,
        content: welcomeText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      speakText(welcomeText);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
       if (hasMicPermission === null || hasMicPermission === false) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setHasMicPermission(true);
        } catch (err) {
          setHasMicPermission(false);
          toast({ variant: "destructive", title: "Microphone Access Denied", description: "Please enable microphone permissions." });
          return;
        }
      }
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async (messageContent?: string) => {
    const currentMessage = (typeof messageContent === 'string' ? messageContent : inputValue).trim();
    if (currentMessage === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    if (typeof messageContent !== 'string') { 
        setInputValue('');
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentMessage }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      let botResponse: ReactNode = result.response;
      let isCommandResponse = false;
      
      if (result.toolName === 'symptomAnalyzer' && result.toolResponse) {
        botResponse = <SymptomAnalysisResultCard result={result.toolResponse as SymptomAnalyzerOutput}/>;
        isCommandResponse = true;
      } else if (result.toolName === 'generateMCQs' && result.toolResponse) {
        botResponse = <MCQResultCard result={result.toolResponse as MedicoMCQGeneratorOutput} />;
        isCommandResponse = true;
      } else if (result.toolName && result.toolResponse) {
        // Fallback for other tools (like notes)
        botResponse = <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(result.toolResponse, null, 2)}</pre>;
        isCommandResponse = true;
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        toolName: result.toolName,
        isCommandResponse,
      };

      setMessages(prev => [...prev, botMessage]);
      speakText(result.response);

    } catch (error) {
        const errorMessageText = error instanceof Error ? error.message : "An unknown error occurred.";
        const botErrorMessage: Message = {
            id: `bot-error-${Date.now()}`,
            content: `Sorry, an error occurred: ${errorMessageText}`,
            sender: 'bot',
            timestamp: new Date(),
            isErrorResponse: true,
        };
        setMessages(prev => [...prev, botErrorMessage]);
    } finally {
        setIsLoading(false);
    }
};

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior });
    }
  };
  
  useEffect(() => {
    scrollToBottom('auto');
  }, [messages]);


  const handleScroll = () => {
    if (viewportRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
      const atBottom = scrollHeight - scrollTop <= clientHeight + 5; 
      setShowScrollToBottom(!atBottom && scrollTop < scrollHeight - clientHeight - 50);
    }
  };

  useEffect(() => {
    const currentViewport = viewportRef.current;
    if (currentViewport) {
      currentViewport.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (currentViewport) {
        currentViewport.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);


  return (
    <Card className="chat-glow-container flex-1 flex flex-col shadow-lg rounded-xl h-full relative bg-gradient-to-br from-card via-card to-secondary/10 dark:from-card dark:via-card dark:to-secondary/5">
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-grow p-4" viewportRef={viewportRef} ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <ChatThinkingIndicator />}
          </div>
        </ScrollArea>
         {showScrollToBottom && (
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-20 right-4 h-10 w-10 rounded-full bg-background/70 backdrop-blur-sm shadow-lg hover:bg-primary/20 z-10" 
            onClick={() => scrollToBottom()}
            aria-label="Scroll to bottom"
          >
            <ArrowDownCircle className="h-5 w-5 text-primary" />
          </Button>
        )}
      </CardContent>
      <div className="border-t p-4 bg-background/80 backdrop-blur-sm">
        {userRole === 'medico' && <ChatCommands onSendMessage={handleSendMessage} />}
        {hasMicPermission === false && (
             <Alert variant="destructive" className="mb-2">
              <AlertTitle>Microphone Access Denied</AlertTitle>
              <AlertDescription className="text-xs">Voice input is disabled. Please enable microphone permissions in your browser settings.</AlertDescription>
             </Alert>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleListening}
            disabled={hasMicPermission === false || !(typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window))}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            className="hover:bg-primary/10"
          >
            {isListening ? <MicOff className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5 text-primary" />}
          </Button>
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full resize-none pr-3 rounded-xl border-border/70 focus:border-primary" 
            rows={1}
            placeholder={isListening ? "Listening..." : "Type your message or /command..."} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading || isListening}
            aria-label="Message input"
          />
          <Button onClick={() => handleSendMessage()} size="icon" aria-label="Send message" disabled={isLoading || inputValue.trim() === ''} className="rounded-full">
             <SendHorizonal className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVoiceOutputEnabled(prev => !prev)}
            aria-label={isVoiceOutputEnabled ? "Disable voice output" : "Enable voice output"}
            disabled={!(typeof window !== 'undefined' && 'speechSynthesis' in window)}
            className="hover:bg-primary/10"
          >
            {isVoiceOutputEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
