
// src/components/pro/differential-diagnosis-assistant.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Brain, ListChecks, Microscope, Stethoscope, Lightbulb } from 'lucide-react';
import type { SymptomAnalyzerOutput, DiagnosisItem, InvestigationItem, SymptomAnalyzerInput } from '@/ai/agents/SymptomAnalyzerAgent';
import { SymptomForm } from '../symptom-analyzer/symptom-form'; // Re-using the form
import { analyzeSymptoms } from '@/ai/agents/SymptomAnalyzerAgent';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

function getConfidenceColor(confidence?: DiagnosisItem['confidence']): string {
  switch (confidence) {
    case 'High': return 'text-red-600 dark:text-red-400';
    case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
    case 'Low': return 'text-orange-600 dark:text-orange-400';
    case 'Possible': return 'text-blue-600 dark:text-blue-400';
    default: return 'text-muted-foreground';
  }
}

export function DifferentialDiagnosisAssistant() {
  const [analysisResult, setAnalysisResult] = useState<SymptomAnalyzerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisStart = async (input: SymptomAnalyzerInput) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
        const result = await analyzeSymptoms(input);
        setAnalysisResult(result);
    } catch (agentError) {
        const errorMessage = agentError instanceof Error ? agentError.message : "An unknown error occurred.";
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
        <Lightbulb className="h-5 w-5 text-blue-600" />
        <AlertTitle className="font-semibold text-blue-700 dark:text-blue-500">Clinical Decision Support</AlertTitle>
        <AlertDescription className="text-blue-600/90 dark:text-blue-500/90 text-xs">
          This tool provides AI-powered suggestions based on symptom input. It is intended to augment, not replace, clinical judgment.
        </AlertDescription>
      </Alert>

       <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl">Provide Clinical Input</CardTitle>
          <CardDescription>Enter patient symptoms and context to generate a differential diagnosis and management plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <SymptomForm onAnalysisStart={handleAnalysisStart} isLoading={isLoading}/>
        </CardContent>
      </Card>
      
      {isLoading && (
         <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Generating clinical suggestions...</p>
        </div>
      )}

      {analysisResult && !isLoading && (
        <Card className="mt-6 shadow-lg rounded-xl border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-primary flex items-center gap-2">
                <Brain className="h-5 w-5"/>
                AI-Powered Clinical Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] p-1">
                <div className="space-y-4 p-2">
                    {/* Differential Diagnoses */}
                    <h4 className="font-semibold text-md text-foreground flex items-center gap-2"><ListChecks/>Differential Diagnoses</h4>
                    <div className="space-y-2">
                    {analysisResult.diagnoses.map((diag, index) => (
                        <div key={index} className="p-3 bg-muted/40 rounded-lg border">
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-sm text-foreground">{diag.name}</span>
                                <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-full", getConfidenceColor(diag.confidence))}>{diag.confidence}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 italic">{diag.rationale}</p>
                        </div>
                    ))}
                    </div>

                    {/* Investigations */}
                    {analysisResult.suggestedInvestigations && (
                    <div className="pt-4 border-t">
                        <h4 className="font-semibold text-md text-foreground flex items-center gap-2"><Microscope/>Suggested Investigations</h4>
                        <ul className="list-disc list-inside pl-4 mt-2 space-y-1 text-sm">
                        {(analysisResult.suggestedInvestigations as string[]).map((inv, index) => (
                            <li key={index}>
                                {inv}
                            </li>
                        ))}
                        </ul>
                    </div>
                    )}

                    {/* Management */}
                    {analysisResult.suggestedManagement && (
                    <div className="pt-4 border-t">
                        <h4 className="font-semibold text-md text-foreground flex items-center gap-2"><Stethoscope/>Management Suggestions</h4>
                        <ul className="list-disc list-inside pl-4 mt-2 space-y-1 text-sm">
                        {analysisResult.suggestedManagement.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                        </ul>
                    </div>
                    )}
                </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
