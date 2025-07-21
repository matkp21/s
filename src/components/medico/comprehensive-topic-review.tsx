// src/components/medico/comprehensive-topic-review.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Book, Wand2 } from 'lucide-react';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { getComprehensiveReview } from '@/ai/agents/medico/ComprehensiveTopicReviewAgent';
import { ComprehensiveReviewOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import { SolvedQuestionPapersViewer } from './solved-question-papers-viewer';
import { MermaidRenderer } from '../markdown/mermaid-renderer';

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ComprehensiveTopicReview() {
  const { execute: runReview, data: reviewData, isLoading, error, reset } = useAiAgent(getComprehensiveReview, ComprehensiveReviewOutputSchema);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: "" },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await runReview(data);
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
                <FormLabel htmlFor="topic-review" className="text-base">Medical Topic</FormLabel>
                <FormControl>
                  <Input
                    id="topic-review"
                    placeholder="e.g., Pneumonia, Acute Myocardial Infarction"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full sm:w-auto rounded-lg group" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Review...</>
            ) : (
              <><Wand2 className="mr-2 h-4 w-4" /> Generate Comprehensive Review</>
            )}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {reviewData && (
        <div className="space-y-4 mt-6">
          <h2 className="text-2xl font-bold">Comprehensive Review for: {reviewData.topic}</h2>
          
          {reviewData.studyNotes && (
             <SolvedQuestionPapersViewer 
                content={{ enhancedContent: reviewData.studyNotes }}
                title="Generated Study Notes"
                description="Key points and summary for your topic."
            />
          )}

          {reviewData.mcqs && (
            <SolvedQuestionPapersViewer
                content={reviewData.mcqs}
                title="Practice MCQs"
                description="Test your knowledge with these questions."
            />
          )}

          {reviewData.flowchart && (
             <Card className="shadow-md rounded-xl">
                <CardHeader>
                    <CardTitle>Generated Flowchart</CardTitle>
                </CardHeader>
                <CardContent>
                    <MermaidRenderer chart={reviewData.flowchart.nodes.map(n => `  ${n.id}["${n.data.label}"]`).join('\n') + '\n' + reviewData.flowchart.edges.map(e => `  ${e.source} --> ${e.target}`).join('\n')} />
                </CardContent>
             </Card>
          )}

        </div>
      )}
    </div>
  );
}
