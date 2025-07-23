// src/components/medico/study-timetable-creator.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CalendarClock, Wand2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { createStudyTimetable, type MedicoStudyTimetableInput, type MedicoStudyTimetableOutput } from '@/ai/agents/medico/StudyTimetableCreatorAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { MedicoStudyTimetableInputSchema } from '@/ai/schemas/medico-tools-schemas';
import { MarkdownRenderer } from '../markdown/markdown-renderer';
import { NextStepsDisplay } from './next-steps-display';

type TimetableFormValues = z.infer<typeof MedicoStudyTimetableInputSchema>;

export function StudyTimetableCreator() {
  const { toast } = useToast();
  const { user } = useProMode();
  const { mutate: runCreateTable, data: timetableData, isPending: isLoading, error, reset } = useAiAgent<MedicoStudyTimetableInput, MedicoStudyTimetableOutput>(createStudyTimetable, {
    onSuccess: (data, input) => {
      toast({
        title: "Study Timetable Generated!",
        description: `Your personalized schedule for the ${input.examName} is ready.`,
      });
    }
  });

  const form = useForm<TimetableFormValues>({
    resolver: zodResolver(MedicoStudyTimetableInputSchema),
    defaultValues: {
      examName: "",
      examDate: undefined,
      subjects: [],
      studyHoursPerWeek: 20,
      performanceContext: "",
    },
  });

  const onSubmit: SubmitHandler<TimetableFormValues> = async (data) => {
    // The schema expects a string for the date, so we format it.
    const inputForAgent = {
        ...data,
        examDate: data.examDate.toISOString().split('T')[0],
        subjects: data.subjects[0].split(',').map(s => s.trim()).filter(Boolean),
    };
    await runCreateTable(inputForAgent as unknown as MedicoStudyTimetableInput);
  };
  
  const handleReset = () => {
    form.reset();
    reset();
  }
  
  const handleSaveToLibrary = async () => {
    if (!timetableData || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    const notesContent = `
## Study Timetable for ${form.getValues('examName')}

**Performance Analysis & Rationale:**
${timetableData.performanceAnalysis}

---

**Generated Timetable:**
${timetableData.timetable}
    `;
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'notes', // Save timetable as a note
        topic: `Study Timetable: ${form.getValues('examName')}`,
        userId: user.uid,
        notes: notesContent,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "Your study timetable has been saved." });
    } catch (e) {
      console.error("Firestore save error:", e);
      toast({ title: "Save Failed", description: "Could not save timetable to your library.", variant: "destructive" });
    }
  };


  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="examName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Final MBBS Prof" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="examDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="mb-1">Exam Date</FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjects (comma-separated)</FormLabel>
                  <FormControl><Input placeholder="e.g., Medicine, Surgery, Pediatrics" {...field} onChange={e => field.onChange([e.target.value])} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="studyHoursPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Hours per Week</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="performanceContext"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weak Areas / Performance Context (Optional)</FormLabel>
                <FormControl><Textarea placeholder="e.g., Weak in clinical case application in Neurology, find pharmacology complex." {...field} /></FormControl>
                <FormDescription className="text-xs">Provide context to help the AI prioritize subjects in your schedule.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg group" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate Timetable</>}
            </Button>
            {timetableData && <Button type="button" variant="outline" onClick={handleReset} className="rounded-lg">Clear</Button>}
          </div>
        </form>
      </Form>
      
      {error && (
        <Alert variant="destructive" className="rounded-lg my-4">
          <AlertTitle>Error Generating Timetable</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {timetableData && (
        <Card className="shadow-md rounded-xl mt-6 border-pink-500/30">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CalendarClock className="h-6 w-6 text-pink-600" />
              Your Personalized Study Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ScrollArea className="h-[50vh] p-1 border bg-background rounded-lg">
                <div className="p-4 space-y-4">
                    {timetableData.performanceAnalysis && (
                        <Alert>
                            <AlertTitle>AI Rationale</AlertTitle>
                            <AlertDescription>{timetableData.performanceAnalysis}</AlertDescription>
                        </Alert>
                    )}
                    <MarkdownRenderer content={timetableData.timetable}/>
                </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <NextStepsDisplay 
                nextSteps={timetableData.nextSteps}
                onSaveToLibrary={handleSaveToLibrary}
                isUserLoggedIn={!!user}
            />
          </CardFooter>
        </Card>
      )}

    </div>
  );
}
