// src/components/medico/solved-question-papers-viewer.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, BookCopy, Wand2, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { generateExamPaper, type MedicoExamPaperInput, type MedicoExamPaperOutput } from '@/ai/agents/medico/ExamPaperAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '../markdown/markdown-renderer';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MedicoExamPaperInputSchema } from '@/ai/schemas/medico-tools-schemas';
import { NextStepsDisplay } from './next-steps-display';

type ExamPaperFormValues = z.infer<typeof MedicoExamPaperInputSchema>;

interface SolvedQuestionPapersViewerProps {
    content: MedicoExamPaperOutput;
    title: string;
    description: string;
    children?: React.ReactNode;
}

export const SolvedQuestionPapersViewerComponent: React.FC<SolvedQuestionPapersViewerProps> = ({ content, title, description, children }) => {
    return (
        <Card className="shadow-md rounded-xl mt-6 border-green-500/30 bg-gradient-to-br from-card to-green-500/5 relative">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookCopy className="h-6 w-6 text-green-600" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] p-1 border bg-background rounded-lg">
              <div className="p-4 space-y-6">
                {content.mcqs && content.mcqs.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Multiple Choice Questions</h3>
                    <div className="space-y-4">
                      {content.mcqs.map((mcq, index) => (
                        <Card key={index} className="p-3 bg-card/80 shadow-sm rounded-lg">
                          <p className="font-semibold mb-2 text-foreground text-sm">Q{index + 1}: {mcq.question}</p>
                          <ul className="space-y-1.5 text-xs">
                            {mcq.options.map((opt, optIndex) => (
                              <li key={optIndex} className={cn("p-2 border rounded-md transition-colors", opt.isCorrect ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-medium" : "border-border")}>
                                {String.fromCharCode(65 + optIndex)}. {opt.text}
                              </li>
                            ))}
                          </ul>
                          {mcq.explanation && (
                            <div className="text-xs mt-2 text-muted-foreground italic border-t pt-2">
                              <MarkdownRenderer content={`**Explanation:** ${mcq.explanation}`} />
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {content.essays && content.essays.length > 0 && (
                   <div>
                    <h3 className="font-semibold text-lg mb-2">Essay Questions</h3>
                     <div className="space-y-4">
                      {content.essays.map((essay, index) => (
                        <Card key={`essay-${index}`} className="p-3 bg-card/80 shadow-sm rounded-lg">
                          <p className="font-semibold mb-2 text-foreground text-sm">Essay Q{index + 1}: {essay.question}</p>
                          <div className="text-xs mt-2 text-muted-foreground italic border-t pt-2">
                             <MarkdownRenderer content={`**Answer Outline:** ${essay.answer_outline}`} />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          {children && <CardFooter className="p-4 border-t">{children}</CardFooter>}
        </Card>
    )
}

export function SolvedQuestionPapersViewer() {
  const { toast } = useToast();
  const { user } = useProMode();
  const { execute: runGenerateExam, data: examData, isLoading, error, reset } = useAiAgent(generateExamPaper, {
    onSuccess: (data, input) => {
      if (!data || (!data.mcqs?.length && !data.essays?.length)) {
        toast({
          title: "Generation Issue",
          description: "The AI returned an empty paper. Please try a different topic.",
          variant: "default",
        });
        return;
      }
      toast({
        title: "Exam Paper Generated!",
        description: `Mock paper for "${input.examType}" is ready.`,
      });
    },
  });

  const form = useForm<ExamPaperFormValues>({
    resolver: zodResolver(MedicoExamPaperInputSchema),
    defaultValues: { examType: "", year: "", count: 10 },
  });

  const onSubmit: SubmitHandler<ExamPaperFormValues> = async (data) => {
    await runGenerateExam(data as MedicoExamPaperInput);
  };
  
  const handleReset = () => {
    form.reset();
    reset();
  }

  const handleSaveToLibrary = async () => {
    if (!examData || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'examPaper',
        topic: examData.topicGenerated,
        userId: user.uid,
        mcqs: examData.mcqs || [],
        essays: examData.essays || [],
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This exam paper has been saved." });
    } catch (e) {
      console.error("Firestore save error:", e);
      toast({ title: "Save Failed", description: "Could not save to library.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="examType"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel htmlFor="examType-gen" className="text-base">Exam Name / Type</FormLabel>
                  <FormControl>
                    <Input id="examType-gen" placeholder="e.g., Final MBBS Prof, USMLE Step 1" {...field} className="rounded-lg text-base py-2.5" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="year-gen" className="text-base">Year (Optional)</FormLabel>
                  <FormControl>
                    <Input id="year-gen" placeholder="e.g., 2023" {...field} className="rounded-lg text-base py-2.5" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="count-gen" className="text-base">Number of MCQs</FormLabel>
                  <FormControl>
                    <Input id="count-gen" type="number" min="1" max="20" {...field} className="rounded-lg text-base py-2.5" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Wand2 className="mr-2 h-4 w-4 transition-transform" /> Generate Exam Paper</>
              )}
            </Button>
            {examData && (
              <Button type="button" variant="outline" onClick={handleReset} className="rounded-lg">Clear</Button>
            )}
          </div>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {examData && (
        <SolvedQuestionPapersViewerComponent
          content={examData}
          title={`Generated Paper: ${examData.topicGenerated}`}
          description="Review the AI-generated questions and structured answers below."
        >
          <NextStepsDisplay 
            nextSteps={examData.nextSteps}
            onSaveToLibrary={handleSaveToLibrary}
            isUserLoggedIn={!!user}
          />
        </SolvedQuestionPapersViewerComponent>
      )}
    </div>
  );
}
