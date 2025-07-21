// src/components/medico/medico-advanced-notes.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Wand2, FileText, BrainCircuit, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { generateComprehensiveNotes, type MbbsStudyInput, type MbbsStudyOutput } from '@/ai/agents/medico/MbbsStudyAgent';
import { MbbsStudyInputSchema } from '@/ai/schemas/medico-tools-schemas';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import Image from 'next/image';
import { NextStepsDisplay } from './next-steps-display';
import { useProMode } from '@/contexts/pro-mode-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FormValues = z.infer<typeof MbbsStudyInputSchema>;

const subjects = ["Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology", "Microbiology", "Forensic Medicine", "Community Medicine", "Ophthalmology", "ENT", "General Medicine", "General Surgery", "Obstetrics & Gynaecology", "Pediatrics", "Other"] as const;

export function MedicoAdvancedNotes() {
  const { toast } = useToast();
  const { user } = useProMode();
  const { mutate: runGenerateNotes, data: generatedNotes, isPending: isLoading, error, reset } = useAiAgent<MbbsStudyInput, MbbsStudyOutput>(generateComprehensiveNotes, {
    onSuccess: (data, input) => {
      toast({
        title: "Advanced Notes Generated!",
        description: `Notes for "${input.topic}" are ready.`,
      });
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(MbbsStudyInputSchema),
    defaultValues: {
      topic: "",
      subject: "General Medicine",
      year: "Final Year",
      examType: "University",
      marks: "10",
    },
  });

  const handleReset = () => {
    form.reset();
    reset();
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await runGenerateNotes(data);
  };
  
  // Note: Saving logic can be added later if needed.

  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-purple-500/50 bg-purple-500/10">
        <BrainCircuit className="h-5 w-5 text-purple-600" />
        <AlertTitle className="font-semibold text-purple-700 dark:text-purple-500">MedGemma-Powered Notes</AlertTitle>
        <AlertDescription className="text-purple-600/90 dark:text-purple-500/90 text-xs">
          This tool leverages a specialized medical LLM (MedGemma) for text and an image model for diagrams to generate comprehensive study notes.
        </AlertDescription>
      </Alert>
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="topic-medgemma" className="text-base">Topic/Question</FormLabel>
                <FormControl>
                  <Input id="topic-medgemma" placeholder="e.g., Diabetic Ketoacidosis" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </FormItem>
                )}
            />
            {/* Additional fields for year, exam, marks can be added here if needed */}
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg group" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate Notes</>}
            </Button>
            {generatedNotes && (<Button type="button" variant="outline" onClick={handleReset} className="rounded-lg">Clear</Button>)}
          </div>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="rounded-lg my-4">
          <AlertTitle>Error Generating Notes</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {generatedNotes && (
        <Card className="shadow-md rounded-xl mt-6 border-primary/30 relative">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><FileText className="h-6 w-6 text-primary" />Advanced Notes: {form.getValues("topic")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
               <div>
                  <h3 className="font-semibold text-lg text-primary mb-2">Summary & Key Points</h3>
                   <div className="space-y-2 text-sm bg-primary/10 p-4 rounded-lg">
                     <p className="font-medium text-foreground">{generatedNotes.enhancedContent.summary}</p>
                     <ul className="list-disc list-inside space-y-1 pt-2 border-t border-primary/20">
                        {generatedNotes.enhancedContent.bulletPoints.map((point, i) => <li key={i}>{point}</li>)}
                     </ul>
                   </div>
               </div>
               <div>
                  <h3 className="font-semibold text-lg text-primary mb-2">Detailed Breakdown</h3>
                  <ScrollArea className="h-[400px] p-1 border bg-background rounded-lg">
                      <div className="p-4">
                          <MarkdownRenderer content={generatedNotes.enhancedContent.headings.map(h => `## ${h.title}\n${h.content}`).join('\n\n')} />
                      </div>
                  </ScrollArea>
              </div>
            </div>
             <div className="lg:col-span-1 space-y-4">
                <div>
                   <h3 className="font-semibold text-lg text-primary mb-2">Generated Diagram</h3>
                   <div className="relative aspect-square w-full border rounded-lg overflow-hidden bg-muted/30">
                     {generatedNotes.enhancedContent.diagramUrl ? (
                         <Image src={generatedNotes.enhancedContent.diagramUrl} alt={`Diagram for ${form.getValues("topic")}`} layout="fill" objectFit="contain" data-ai-hint="medical diagram" />
                     ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                            <ImageIcon className="h-10 w-10 opacity-50 mb-2"/>
                            <p className="text-xs">Visual aid could not be generated for this topic.</p>
                         </div>
                     )}
                   </div>
                </div>
                 <div>
                   <h3 className="font-semibold text-lg text-primary mb-2">References</h3>
                    <ul className="list-disc list-inside text-sm space-y-1 bg-muted/40 p-3 rounded-lg">
                        {generatedNotes.references.map((ref, i) => <li key={i}>{ref}</li>)}
                    </ul>
                </div>
             </div>
          </CardContent>
           <CardFooter className="p-4 border-t">
              <NextStepsDisplay
                nextSteps={generatedNotes.nextSteps}
                onSaveToLibrary={() => { /* Implement save logic if needed */ }}
                isUserLoggedIn={!!user}
              />
            </CardFooter>
        </Card>
      )}
    </div>
  );
}
