// src/components/pro/smart-dictation.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mic, Settings, Wand2, Loader2, FileText, Info, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { structureNote } from '@/ai/agents/medico/NoteStructurerAgent';


export function SmartDictation() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'general' | 'soap'>('general');
  const [structuredNote, setStructuredNote] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only on the client
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionImpl) {
        const recognitionInstance = new SpeechRecognitionImpl();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
             interimTranscript += event.results[i][0].transcript;
          }
          setTranscript(interimTranscript);
        };
        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          toast({ variant: 'destructive', title: 'Voice Input Error', description: `Could not recognize speech: ${event.error}` });
          setIsRecording(false);
        };
        recognitionInstance.onend = () => {
          setIsRecording(false);
        };
        recognitionRef.current = recognitionInstance;
      }
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, [toast]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
        toast({title: "Dictation Not Supported", description: "Speech recognition is not available in your browser.", variant: "destructive"});
        return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setStructuredNote(null);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleStructureNote = async () => {
    if (!transcript.trim()) {
      toast({ title: "No text to structure", variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    try {
      const result = await structureNote({ rawText: transcript, template: selectedTemplate });
      setStructuredNote(result.structuredText);
      toast({ title: "Note Structured", description: "AI has formatted your dictated text." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to structure note.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-teal-500/50 bg-teal-500/10">
            <Info className="h-5 w-5 text-teal-600" />
            <AlertTitle className="font-semibold text-teal-700 dark:text-teal-500">AI-Powered Dictation</AlertTitle>
            <AlertDescription className="text-teal-600/90 dark:text-teal-500/90 text-xs">
              Dictate your notes and let the AI automatically structure them into a SOAP note or clean up the text. This feature relies on browser-based Speech Recognition.
            </AlertDescription>
      </Alert>
      
      <Card className="shadow-md rounded-xl border-cyan-500/30 bg-gradient-to-br from-card via-card to-cyan-500/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Mic className="h-6 w-6 text-cyan-600" />
            Dictation Pad
          </CardTitle>
          <CardDescription>Use your voice to dictate notes. Edit the transcript, then structure it with AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={toggleRecording} className="w-full sm:w-auto rounded-lg group">
            <Mic className="mr-2 h-4 w-4" />
            {isRecording ? 'Stop Dictation' : 'Start Dictation'}
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transcript-output">Raw Dictation Transcript</Label>
              <Textarea
                id="transcript-output"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={isRecording ? "Listening..." : "Your dictated text will appear here. You can also type or paste text."}
                className="min-h-[200px] mt-1 rounded-lg bg-background"
              />
            </div>
             <div className="space-y-4">
               <div>
                  <Label htmlFor="template-select">Structuring Template</Label>
                  <Select value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v as any)}>
                    <SelectTrigger id="template-select" className="w-full mt-1 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Cleanup</SelectItem>
                      <SelectItem value="soap">SOAP Note</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <Button onClick={handleStructureNote} disabled={isProcessing || !transcript.trim()} className="w-full rounded-lg">
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                 Structure Note with AI
               </Button>
               {structuredNote && (
                  <div>
                    <Label htmlFor="structured-output">AI-Structured Note</Label>
                    <Textarea
                      id="structured-output"
                      value={structuredNote}
                      readOnly
                      placeholder="Structured text will appear here..."
                      className="min-h-[120px] mt-1 rounded-lg bg-muted"
                    />
                  </div>
               )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
