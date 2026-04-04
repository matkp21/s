
"use client";

import { useState } from 'react';
import { SymptomForm } from '@/components/symptom-analyzer/symptom-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ListChecks, Brain } from 'lucide-react';
import { analyzeSymptoms, type SymptomAnalyzerOutput, type SymptomAnalyzerInput, type DiagnosisItem } from '@/ai/agents/SymptomAnalyzerAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

function getConfidenceColor(confidence?: DiagnosisItem['confidence']): string {
  switch (confidence) {
    case 'High': return 'text-red-600 dark:text-red-400';
    case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
    case 'Low': return 'text-orange-600 dark:text-orange-400';
    default: return 'text-muted-foreground';
  }
}

export function SymptomAnalysisMode() {
  const [analysisResult, setAnalysisResult] = useState<SymptomAnalyzerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisStart = async (rawInput: SymptomAnalyzerInput) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeSymptoms(rawInput);
      setAnalysisResult(result);
    } catch (agentError) {
      const errorMessage = agentError instanceof Error ? agentError.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Enter Symptoms</CardTitle>
          <CardDescription>Describe symptoms and context. AI will provide insights.</CardDescription>
        </CardHeader>
        <CardContent>
          <SymptomForm onAnalysisStart={handleAnalysisStart} isLoading={isLoading}/>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>Potential diagnoses and suggestions.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Analyzing...</p>
            </div>
          )}
          {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          {analysisResult && (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><ListChecks className="text-primary h-5 w-5"/>Potential Considerations:</h3>
                {analysisResult.diagnoses.map((diag, i) => (
                  <div key={i} className="p-3 bg-muted/40 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{diag.name}</span>
                      <span className={cn("text-xs font-bold", getConfidenceColor(diag.confidence))}>{diag.confidence}</span>
                    </div>
                    {diag.rationale && <p className="text-xs text-muted-foreground mt-1 italic">{diag.rationale}</p>}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          {!isLoading && !analysisResult && !error && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Brain className="h-12 w-12 mb-3 opacity-20" />
                <p>Submit symptoms to begin analysis.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
