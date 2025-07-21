
// src/app/medico/mock-pyqs/page.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, BookCopy, Wand2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { generateExamPaper, type MedicoExamPaperInput } from '@/ai/agents/medico/ExamPaperAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { MedicoExamPaperOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import { SolvedQuestionPapersViewer } from '@/components/medico/solved-question-papers-viewer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NextStepsDisplay } from '@/components/medico/next-steps-display';

const subjects = ["Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology", "Microbiology", "Forensic Medicine", "Community Medicine", "Ophthalmology", "ENT", "General Medicine", "General Surgery", "Obstetrics & Gynaecology", "Pediatrics", "Other"] as const;

const formSchema = z.object({
  examType: z.string().min(3, { message: "Exam type must be at least 3 characters." }).max(100),
  year: z.string().optional(),
  count: z.coerce.number().int().min(1, "At least 1 MCQ.").max(20, "Max 20 MCQs.").default(10),
  examFormat: z.enum(['full_university', 'mcqs_only']).default('full_university'),
  subject: z.enum(subjects).optional(),
});
type ExamPaperFormValues = z.infer<typeof formSchema>;

export default function MockPYQsPage() {
  const { toast } = useToast();
  const { user } = useProMode();
  const { execute: runGenerateExam, data: examData, isLoading, error, reset } = useAiAgent(generateExamPaper, MedicoExamPaperOutputSchema, {
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
    resolver: zodResolver(formSchema),
    defaultValues: { examType: "Final MBBS Prof Mock", year: "", count: 10, examFormat: "full_university", subject: undefined },
  });

  const onSubmit: SubmitHandler<ExamPaperFormValues> = async (data) => {
    await runGenerateExam({ ...data, subject: data.subject || undefined });
  };

  const handleReset = () => {
    form.reset();
    reset();
  };

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
    <PageWrapper title="Mock Previous Year Question Paper">
      <div className="space-y-6">
        <Card className="shadow-lg rounded-xl">
            <CardHeader>
                <CardTitle className="text-xl">Generate Exam Paper</CardTitle>
                <CardDescription>Create a mock exam paper by specifying the exam type and other details. AI will attempt to map questions to relevant NMC competencies.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="examType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel htmlFor="examType-gen">Exam Name / Type</FormLabel>
                                <FormControl>
                                    <Input id="examType-gen" placeholder="e.g., Final MBBS Prof, USMLE Step 1" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Subject"/></SelectTrigger></FormControl>
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
                            name="examFormat"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Exam Format</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="full_university">Full University Paper (Essays + MCQs)</SelectItem>
                                        <SelectItem value="mcqs_only">MCQs Only</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="count"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel htmlFor="count-gen">Number of MCQs</FormLabel>
                                <FormControl>
                                    <Input id="count-gen" type="number" min="1" max="20" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" className="w-full sm:w-auto rounded-lg group" disabled={isLoading}>
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
            </CardContent>
        </Card>

        {error && (
            <Alert variant="destructive" className="rounded-lg">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {examData && (
          <SolvedQuestionPapersViewer
            content={examData}
            title={`Generated Paper: ${examData.topicGenerated}`}
            description="Review the AI-generated questions and structured answers below."
          >
             <CardFooter className="p-0 pt-4">
                <NextStepsDisplay 
                    nextSteps={examData.nextSteps} 
                    onSaveToLibrary={handleSaveToLibrary} 
                    isUserLoggedIn={!!user} 
                />
            </CardFooter>
          </SolvedQuestionPapersViewer>
        )}
      </div>
    </PageWrapper>
  );
}
