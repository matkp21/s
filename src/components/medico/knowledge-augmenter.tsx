// src/components/medico/knowledge-augmenter.tsx
"use client";

import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, Wand2, UploadCloud, HelpCircle, CheckCircle, FileWarning } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { validateAndAugmentNotes, type KnowledgeAugmenterInput, type KnowledgeAugmenterOutput } from '@/ai/agents/medico/KnowledgeAugmenterAgent';
import { MarkdownRenderer } from '../markdown/markdown-renderer';
import { useState } from 'react';

const formSchema = z.object({
  file: z.instanceof(File, { message: "Please upload your notes file." }),
  question: z.string().min(5, { message: "Question must be at least 5 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function KnowledgeAugmenter() {
  const { toast } = useToast();
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);

  const { mutate: runAugmentation, data: augmentationResult, isPending: isLoading, error, reset } = useAiAgent<KnowledgeAugmenterInput, KnowledgeAugmenterOutput>(validateAndAugmentNotes, {
    onSuccess: (data, input) => {
      toast({
        title: "Analysis Complete!",
        description: "Your notes have been validated and augmented.",
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUri(reader.result as string);
        form.setValue('file', file);
        form.clearErrors('file');
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!fileDataUri) {
      toast({ title: "File Error", description: "Could not read the uploaded file.", variant: "destructive" });
      return;
    }
    await runAugmentation({
      fileDataUri,
      question: data.question,
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                <FormItem>
                    <FormLabel htmlFor="notes-file-upload">Upload Your Notes (PDF, JPG, PNG)</FormLabel>
                    <FormControl>
                    <Input id="notes-file-upload" type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                    </FormControl>
                    <FormDescription>The AI will read and analyze the content of this file.</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                <FormItem>
                    <FormLabel htmlFor="notes-question">Your Question</FormLabel>
                    <FormControl>
                    <Input id="notes-question" placeholder="e.g., What are the key contraindications?" {...field} />
                    </FormControl>
                     <FormDescription>Ask a specific question about your notes.</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto rounded-lg group" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Augmenting...</>
            ) : (
              <><Wand2 className="mr-2 h-4 w-4" /> Validate & Augment Notes</>
            )}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertTitle>Error During Augmentation</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {augmentationResult ? (
        <Card className="shadow-lg rounded-xl mt-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Sparkles className="h-6 w-6"/>
              Augmented Knowledge
            </CardTitle>
             <CardDescription>
              Your notes combined with essential textbook information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><HelpCircle/>Augmented Answer</h3>
              <div className="p-4 border rounded-lg bg-background">
                <MarkdownRenderer content={augmentationResult.augmentedAnswer} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-green-600"><CheckCircle/>Notes Validation (Missing Information)</h3>
              <div className="p-4 border border-green-500/50 rounded-lg bg-green-500/10">
                <ul className="list-disc list-inside space-y-1 text-sm">
                    {augmentationResult.missingInfo.map((info, i) => <li key={i}>{info}</li>)}
                </ul>
              </div>
            </div>
            {augmentationResult.shorthandKey.length > 0 && (
                 <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-orange-600"><FileWarning/>Shorthand Key</h3>
                    <div className="p-4 border border-orange-500/50 rounded-lg bg-orange-500/10">
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {augmentationResult.shorthandKey.map((key, i) => <li key={i}><strong>{key.abbreviation}</strong> was interpreted as "{key.interpretation}"</li>)}
                        </ul>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-10 text-muted-foreground bg-card/50 p-6 rounded-xl shadow-inner border border-dashed">
          <UploadCloud className="h-12 w-12 mx-auto mb-3 text-primary/50" />
          <p className="font-semibold">Upload your notes and ask a question.</p>
          <p className="text-sm">The AI will analyze your notes, answer your question, and tell you what's missing.</p>
        </div>
      )}

    </div>
  );
}
