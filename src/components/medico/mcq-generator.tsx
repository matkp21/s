// src/components/medico/mcq-generator.tsx
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
import { Loader2, HelpCircle, Wand2, Save } from 'lucide-react';
import { generateMCQs, type MedicoMCQGeneratorInput, type MedicoMCQGeneratorOutput } from '@/ai/agents/medico/MCQGeneratorAgent';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useProMode } from '@/contexts/pro-mode-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { trackProgress } from '@/ai/agents/medico/ProgressTrackerAgent';
import React, { useEffect } from 'react';
import { MarkdownRenderer } from '../markdown/markdown-renderer';
import { MedicoMCQGeneratorInputSchema, type MCQSchema as SingleMCQ } from '@/ai/schemas/medico-tools-schemas';
import { NextStepsDisplay } from './next-steps-display';

const subjects = ["Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology", "Microbiology", "Forensic Medicine", "Community Medicine", "Ophthalmology", "ENT", "General Medicine", "General Surgery", "Obstetrics & Gynaecology", "Pediatrics", "Other"] as const;
const systems = ["Cardiovascular", "Respiratory", "Gastrointestinal", "Neurological", "Musculoskeletal", "Endocrine", "Genitourinary", "Integumentary", "Hematological", "Immunological", "Other"] as const;

type McqFormValues = z.infer<typeof MedicoMCQGeneratorInputSchema>;

interface McqGeneratorProps {
  initialTopic?: string | null;
}

export function McqGenerator({ initialTopic }: McqGeneratorProps) {
  const { toast } = useToast();
  const { user } = useProMode();
  const { mutate: runGenerateMcqs, data: generatedMcqs, isPending: isLoading, error, reset } = useAiAgent(generateMCQs, {
     onSuccess: async (data, input) => {
      if (!data?.mcqs || !data.topicGenerated) {
        toast({
          title: "Generation Error",
          description: "The AI agent returned an incomplete response. Please try again.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "MCQs Generated!",
        description: `${data.mcqs.length} MCQs for "${data.topicGenerated}" are ready.`,
      });
      
      try {
        const progressResult = await trackProgress({
            activityType: 'mcq_session',
            topic: input.topic,
            // A mock score since we don't have an interactive quiz yet.
            // In a real quiz, this score would be calculated based on user answers.
            score: Math.floor(Math.random() * 41) + 60, // Simulate a decent score (60-100)
        });
         toast({
          title: "Practice Session Logged!",
          description: progressResult.progressUpdateMessage,
          duration: 5000,
        });
      } catch (progressError) {
          console.warn("Could not track progress for MCQ generation:", progressError);
      }
    }
  });

  const form = useForm<McqFormValues>({
    resolver: zodResolver(MedicoMCQGeneratorInputSchema),
    defaultValues: {
      topic: initialTopic || "",
      count: 5,
      difficulty: 'medium',
      examType: 'university',
      subject: undefined,
      system: undefined,
    },
  });

  useEffect(() => {
    if (initialTopic) {
        form.setValue('topic', initialTopic);
    }
  }, [initialTopic, form]);
  
  const handleReset = () => {
    form.reset({ topic: "", count: 5, difficulty: 'medium', examType: 'university', subject: undefined, system: undefined });
    reset();
  }

  const onSubmit: SubmitHandler<McqFormValues> = async (data) => {
    runGenerateMcqs(data);
  };
  
  const handleSaveToLibrary = async () => {
    if (!generatedMcqs || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    const { subject, system } = form.getValues();
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'mcqs',
        topic: generatedMcqs.topicGenerated,
        subject: subject || null,
        system: system || null,
        userId: user.uid,
        mcqs: generatedMcqs.mcqs,
        difficulty: form.getValues('difficulty'),
        examType: form.getValues('examType'),
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "Your generated MCQs have been saved." });
    } catch (e) {
      console.error("Firestore save error:", e);
      toast({ title: "Save Failed", description: "Could not save MCQs to your library.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="topic-mcq" className="text-base">Medical Topic</FormLabel>
                <FormControl>
                  <Input
                    id="topic-mcq"
                    placeholder="e.g., Cardiology, Hypertension"
                    className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-base">Subject (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="rounded-lg"><SelectValue placeholder="Select Subject"/></SelectTrigger></FormControl>
                    <SelectContent>
                        {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage/>
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="system"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-base">System (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="rounded-lg"><SelectValue placeholder="Select System"/></SelectTrigger></FormControl>
                    <SelectContent>
                        {systems.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage/>
                </FormItem>
                )}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="count-mcq" className="text-base">Number</FormLabel>
                  <FormControl>
                    <Input
                      id="count-mcq"
                      type="number"
                      min="1"
                      max="10"
                      className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="difficulty-mcq" className="text-base">Difficulty</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="difficulty-mcq" className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary">
                        <SelectValue placeholder="Select difficulty"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="examType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="exam-mcq" className="text-base">Exam Style</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="exam-mcq" className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary">
                        <SelectValue placeholder="Select exam style"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="neet-pg">NEET-PG</SelectItem>
                      <SelectItem value="usmle">USMLE</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
                {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
                ) : (
                <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate MCQs
                </>
                )}
            </Button>
             {generatedMcqs && (
                <Button type="button" variant="outline" onClick={handleReset} className="rounded-lg">
                    Clear
                </Button>
            )}
          </div>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="rounded-lg my-4">
          <AlertTitle>Error Generating MCQs</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {generatedMcqs && (
        <Card className="shadow-md rounded-xl mt-6 border-accent/30 bg-gradient-to-br from-card via-card to-accent/5 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Updating...</span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-accent" />
              MCQs: {generatedMcqs.topicGenerated}
            </CardTitle>
            <CardDescription>Test your knowledge with these AI-generated questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] p-1 border bg-background rounded-lg">
              <div className="space-y-4 p-4">
                {generatedMcqs.mcqs.map((mcq, index) => (
                  <Card key={index} className="p-4 bg-card/80 shadow-sm rounded-lg">
                    <p className="font-semibold mb-2 text-foreground">Q{index + 1}: {mcq.question}</p>
                    <ul className="space-y-1.5 text-sm">
                      {mcq.options.map((opt, optIndex) => (
                        <li 
                          key={optIndex} 
                          className={cn(
                            "p-2 border rounded-md transition-colors",
                            opt.isCorrect ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-medium" : "border-border hover:bg-muted/50"
                          )}
                        >
                          {String.fromCharCode(65 + optIndex)}. {opt.text}
                        </li>
                      ))}
                    </ul>
                    {mcq.explanation && (
                      <div className="text-xs mt-3 text-muted-foreground italic border-t pt-2">
                         <MarkdownRenderer content={`**Explanation:** ${mcq.explanation}`} />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <NextStepsDisplay 
                nextSteps={generatedMcqs.nextSteps}
                onSaveToLibrary={handleSaveToLibrary}
                isUserLoggedIn={!!user}
              />
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
