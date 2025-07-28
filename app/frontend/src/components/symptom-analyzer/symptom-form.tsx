
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { SymptomAnalyzerInput } from '@/ai/agents/SymptomAnalyzerAgent';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SymptomAnalyzerInputSchema } from '@/ai/schemas/symptom-analyzer-schemas';
import type { z } from 'zod';

type SymptomFormValues = z.infer<typeof SymptomAnalyzerInputSchema>;

interface SymptomFormProps {
  onAnalysisStart: (rawInput: SymptomFormValues) => void;
  isLoading: boolean;
}

export function SymptomForm({ onAnalysisStart, isLoading }: SymptomFormProps) {
  const { toast } = useToast();
  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(SymptomAnalyzerInputSchema),
    defaultValues: {
      symptoms: "",
      patientContext: {
        age: undefined,
        sex: undefined,
        history: "",
      }
    },
  });

  const onSubmit: SubmitHandler<SymptomFormValues> = async (data) => {
    onAnalysisStart(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="symptoms"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="symptoms-input" className="text-foreground/90">Symptoms Description</FormLabel>
              <FormControl>
                <Textarea
                  id="symptoms-input"
                  placeholder="e.g., persistent cough, fever for 3 days, headache..."
                  className="min-h-[150px] resize-y rounded-lg border-border/70 focus:border-primary"
                  aria-describedby="symptoms-description"
                  {...field}
                />
              </FormControl>
              <FormDescription id="symptoms-description">
                Provide as much detail as possible for a more relevant analysis.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
              control={form.control}
              name="patientContext.age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 45" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="patientContext.sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biological Sex (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
         <FormField
              control={form.control}
              name="patientContext.history"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief History (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Smoker, Hypertensive" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        <Button type="submit" className="w-full rounded-lg py-3 text-base group" disabled={isLoading} aria-label="Submit symptoms for analysis">
          Analyze
          <Send className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </form>
    </Form>
  );
}
