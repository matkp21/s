// src/components/medico/guided-study-flow.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, PackageCheck, Wand2, BookOpen, FileQuestion, Layers, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MarkdownRenderer } from '../markdown/markdown-renderer';
import { generateGuidedStudySession } from '@/ai/agents/medico/GuidedStudyAgent';
import { GuidedStudyInputSchema, type GuidedStudyOutput } from '@/ai/schemas/medico-tools-schemas';
import type { SingleMCQ } from '@/ai/schemas/medico-tools-schemas';
import { cn } from '@/lib/utils';

type GuidedStudyFormValues = z.infer<typeof GuidedStudyInputSchema>;

export function GuidedStudyFlow() {
  const { toast } = useToast();
  const { user } = useProMode();
  const { execute: runGuidedStudy, data: studyPackage, isLoading, error, reset } = useAiAgent(generateGuidedStudySession, {
    onSuccess: (data, input) => {
      toast({
        title: "Study Package Ready!",
        description: `A full study session for "${input.topic}" has been generated.`,
      });
    },
  });

  const form = useForm<GuidedStudyFormValues>({
    resolver: zodResolver(GuidedStudyInputSchema),
    defaultValues: { topic: "" },
  });

  const onSubmit: SubmitHandler<GuidedStudyFormValues> = async (data) => {
    await runGuidedStudy(data);
  };

  const handleReset = () => {
    form.reset();
    reset();
  };
  
  const handleSaveAllToLibrary = async () => {
    if (!studyPackage || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
        const notesContent = studyPackage.notes;
        const mcqsContent = studyPackage.mcqs;
        const flashcardsContent = studyPackage.flashcards;

        const libraryRef = collection(firestore, `users/${user.uid}/studyLibrary`);

        await addDoc(libraryRef, { type: 'notes', topic: `Guided Study Notes: ${studyPackage.topic}`, notes: notesContent.notes, summaryPoints: notesContent.summaryPoints, diagram: notesContent.diagram, createdAt: serverTimestamp() });
        await addDoc(libraryRef, { type: 'mcqs', topic: `Guided Study MCQs: ${studyPackage.topic}`, mcqs: mcqsContent.mcqs, createdAt: serverTimestamp() });
        await addDoc(libraryRef, { type: 'flashcards', topic: `Guided Study Flashcards: ${studyPackage.topic}`, flashcards: flashcardsContent.flashcards, createdAt: serverTimestamp() });

        toast({ title: "Study Package Saved!", description: "All generated content has been saved to your library." });

    } catch(e) {
        console.error("Firestore save error:", e);
        toast({ title: "Save Failed", description: "Could not save the full study package.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="topic-guided" className="text-base">Medical Topic</FormLabel>
                <FormControl>
                  <Input
                    id="topic-guided"
                    placeholder="e.g., Myocardial Infarction, Chronic Kidney Disease"
                    className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Session...</>
              ) : (
                <><Wand2 className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" /> Start Guided Study Session</>
              )}
            </Button>
            {studyPackage && (
              <Button type="button" variant="outline" onClick={handleReset} className="rounded-lg">
                Clear
              </Button>
            )}
          </div>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {studyPackage && (
        <Card className="shadow-md rounded-xl mt-6 border-blue-500/30 bg-gradient-to-br from-card via-card to-blue-500/5 relative">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <PackageCheck className="h-6 w-6 text-blue-600" />
              Guided Study Package: {studyPackage.topic}
            </CardTitle>
            <CardDescription>A complete study session with notes, questions, and flashcards.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] p-1 border bg-background rounded-lg">
              <div className="p-4 space-y-6">
                
                {/* Study Notes Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-primary flex items-center gap-2"><BookOpen/>Study Notes</h3>
                  <div className="border p-3 rounded-md bg-muted/30">
                     <MarkdownRenderer content={studyPackage.notes.notes} />
                  </div>
                </div>

                {/* MCQs Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-primary flex items-center gap-2"><FileQuestion/>Practice Questions</h3>
                  <div className="space-y-3">
                    {studyPackage.mcqs.mcqs.map((mcq: SingleMCQ, index: number) => (
                      <Card key={index} className="p-3 bg-card/80 shadow-sm">
                        <p className="font-medium mb-1 text-sm">Q{index + 1}: {mcq.question}</p>
                        <ul className="list-disc list-inside ml-4 text-xs space-y-0.5">
                          {mcq.options.map((opt, optIndex) => (
                            <li key={optIndex} className={cn(opt.isCorrect && "text-green-600 dark:text-green-400 font-semibold")}>
                              {String.fromCharCode(65 + optIndex)}. {opt.text}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>
                </div>

                 {/* Flashcards Section */}
                 <div>
                    <h3 className="font-semibold text-lg mb-2 text-primary flex items-center gap-2"><Layers/>Key Flashcards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {studyPackage.flashcards.flashcards.map((fc, index) => (
                        <Card key={index} className="p-3 bg-card/80 shadow-sm">
                          <p className="font-semibold mb-1 text-primary text-xs">Front:</p>
                          <p className="text-sm mb-2">{fc.front}</p>
                          <p className="font-semibold mb-1 text-primary text-xs border-t pt-2">Back:</p>
                          <p className="text-sm">{fc.back}</p>
                        </Card>
                      ))}
                    </div>
                 </div>

              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t flex items-center justify-between">
            <Button onClick={handleSaveAllToLibrary} disabled={!user || isLoading}>
              <Save className="mr-2 h-4 w-4"/> Save Full Package
            </Button>
            {studyPackage.nextSteps && studyPackage.nextSteps.length > 0 && (
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Next Steps <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Recommended Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {studyPackage.nextSteps.map((step, index) => (
                      <DropdownMenuItem key={index} asChild className="cursor-pointer">
                        <Link href={`/medico/${step.toolId}?topic=${encodeURIComponent(step.prefilledTopic)}`}>
                          {step.cta}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
