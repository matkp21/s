// src/components/chat/symptom-analysis-result-card.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ListChecks, Microscope, Stethoscope } from 'lucide-react';
import type { SymptomAnalyzerOutput, DiagnosisItem } from '@/ai/agents/SymptomAnalyzerAgent';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface SymptomAnalysisResultCardProps {
  result: SymptomAnalyzerOutput;
}

const getConfidenceColor = (confidence?: DiagnosisItem['confidence']): string => {
  switch (confidence) {
    case 'High': return 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400';
    case 'Medium': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'Low': return 'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400';
    default: return 'border-border bg-muted/50';
  }
};

export function SymptomAnalysisResultCard({ result }: SymptomAnalysisResultCardProps) {
  return (
    <Card className="w-full bg-background/50 shadow-inner">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            AI Symptom Analysis
        </CardTitle>
        <CardDescription className="text-xs">
          This is not a medical diagnosis. Please consult a professional.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5"><ListChecks className="h-4 w-4"/>Potential Considerations</h4>
          <ul className="space-y-1">
            {result.diagnoses.map((diag, index) => (
              <li key={index} className={cn("p-2 rounded-md border text-xs", getConfidenceColor(diag.confidence))}>
                <div className="flex justify-between items-center">
                    <span className="font-medium">{diag.name}</span>
                    <Badge variant="outline" className="border-current">{diag.confidence}</Badge>
                </div>
                {diag.rationale && <p className="mt-1 opacity-80">{diag.rationale}</p>}
              </li>
            ))}
          </ul>
        </div>
        
        {result.suggestedInvestigations && result.suggestedInvestigations.length > 0 && (
           <div>
             <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5"><Microscope className="h-4 w-4"/>Suggested Investigations</h4>
             <ul className="list-disc list-inside ml-4 text-xs space-y-0.5">
                {result.suggestedInvestigations.map((inv, index) => <li key={index}>{inv.name}</li>)}
             </ul>
            </div>
        )}

        {result.suggestedManagement && result.suggestedManagement.length > 0 && (
           <div>
             <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5"><Stethoscope className="h-4 w-4"/>Management Suggestions</h4>
             <ul className="list-disc list-inside ml-4 text-xs space-y-0.5">
                {result.suggestedManagement.map((step, index) => <li key={index}>{step}</li>)}
             </ul>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
