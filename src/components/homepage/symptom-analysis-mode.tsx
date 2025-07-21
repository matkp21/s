
"use client";

import { useState } from 'react';
import { SymptomForm } from '@/components/symptom-analyzer/symptom-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ListChecks, Sparkles, Brain, Microscope, Stethoscope } from 'lucide-react';
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
  const { isProMode } = useProMode();

  const handleAnalysisComplete = async (result: SymptomAnalyzerOutput | null, err?: string, rawInput?: SymptomAnalyzerInput) => {
    if (err) {
      setError(err);
      setAnalysisResult(null);
      setIsLoading(false);
      return;
    }

    if (rawInput) { 
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const agentResult = await analyzeSymptoms(rawInput);
            setAnalysisResult(agentResult);
        } catch (agentError) {
             const errorMessage = agentError instanceof Error ? agentError.message : "An unknown error occurred.";
             setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    } else { 
        setAnalysisResult(result);
        setError(err || null);
        setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 fade-in">
      <Card className="shadow-lg border-border/50 rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Enter Symptoms</CardTitle>
          <CardDescription>
            Describe symptoms and patient context. Our AI will provide potential insights. Not for self-diagnosis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SymptomForm onAnalysisComplete={handleAnalysisComplete} setIsLoading={setIsLoading} isLoading={isLoading}/>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-border/50 rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Analysis Results</CardTitle>
          <CardDescription>
            Potential diagnoses and suggestions. Always consult a medical professional.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col justify-start">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-sm">Analyzing symptoms with AI...</p>
            </div>
          )}
          {error && !isLoading && (
            <Alert variant="destructive" className="rounded-lg">
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {analysisResult && !isLoading && !error && (
            <ScrollArea className="h-auto max-h-[500px]">
              <div className="space-y-4 fade-in pr-4">
                <div>
                  <h3 className="font-semibold text-lg text-foreground flex items-center mb-2">
                    <ListChecks className="mr-2 h-5 w-5 text-primary" />
                    Potential Considerations:
                  </h3>
                  {analysisResult.diagnoses.length > 0 ? (
                    <ul className="space-y-2">
                      {analysisResult.diagnoses.map((diag, index) => (
                        <li key={index} className="p-3 bg-muted/40 rounded-lg border border-border/30">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-sm text-foreground">{diag.name}</span>
                            {diag.confidence && (
                              <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-full", getConfidenceColor(diag.confidence))}>
                                {diag.confidence}
                              </span>
                            )}
                          </div>
                          {diag.rationale && <p className="text-xs text-muted-foreground mt-1 italic">{diag.rationale}</p>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">No specific considerations could be determined based on the input.</p>
                  )}
                </div>

                {analysisResult.suggestedInvestigations && analysisResult.suggestedInvestigations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg text-foreground flex items-center mb-2">
                      <Microscope className="mr-2 h-5 w-5 text-primary" />
                      Suggested Investigations:
                    </h3>
                    <ul className="list-disc list-inside pl-4 space-y-1 text-sm bg-muted/40 p-3 rounded-lg">
                      {analysisResult.suggestedInvestigations.map((inv, index) => (
                        <li key={index}>{inv}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysisResult.suggestedManagement && analysisResult.suggestedManagement.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg text-foreground flex items-center mb-2">
                      <Stethoscope className="mr-2 h-5 w-5 text-primary" />
                      Initial Management Suggestions:
                    </h3>
                    <ul className="list-disc list-inside pl-4 space-y-1 text-sm bg-muted/40 p-3 rounded-lg">
                      {analysisResult.suggestedManagement.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {isProMode && (
                  <Alert variant="default" className="mt-4 border-primary/50 bg-primary/10 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <AlertTitle className="text-primary font-semibold">Pro Mode Active</AlertTitle>
                    <AlertDescription className="text-primary/80 text-xs">
                      Advanced clinical annotations and further analytical tools are available.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>
          )}
          {!isLoading && !analysisResult && !error && (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-10 flex-grow">
                <Brain className="h-12 w-12 mb-3 text-muted-foreground/50" />
                <p>Results will appear here once symptoms are submitted.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
