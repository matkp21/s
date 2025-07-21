// src/app/pro/diagnostics/page.tsx
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldCheck, Wand2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useProMode } from '@/contexts/pro-mode-context';
import { generateImprovementSuggestions } from '@/ai/agents/pro/systemDiagnosticsAgent';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import type { SystemDiagnosticOutput } from '@/ai/schemas/pro-schemas';

interface DiagnosticResult {
  status: 'ok' | 'error' | 'pending';
  message: string;
  details?: any;
}

interface FullDiagnosticsReport extends SystemDiagnosticOutput {
  checks: Record<string, DiagnosticResult>;
}

export default function SystemDiagnosticsPage() {
  const { user } = useProMode();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState<FullDiagnosticsReport | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunDiagnostics = async () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "You must be logged in to run diagnostics.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    setDiagnosticsData(null);
    setAiSuggestions(null);

    try {
      const functions = getFunctions();
      const runDiagnosticsFunction = httpsCallable(functions, 'runFullDiagnostics');
      const result = (await runDiagnosticsFunction()).data as FullDiagnosticsReport;
      
      setDiagnosticsData(result);
      toast({ title: "Diagnostics Complete", description: `Overall status: ${result.overallStatus.toUpperCase()}` });
      
      // Now, get AI suggestions based on the result
      const suggestionsResult = await generateImprovementSuggestions(result);
      setAiSuggestions(suggestionsResult.suggestions);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Diagnostics error:", err);
      setError(errorMessage);
      toast({ title: "Diagnostics Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const statusCounts = useMemo(() => {
    if (!diagnosticsData) return { ok: 0, error: 0, total: 0 };
    const checks = Object.values(diagnosticsData.checks);
    return {
      ok: checks.filter(c => c.status === 'ok').length,
      error: checks.filter(c => c.status === 'error').length,
      total: checks.length,
    }
  }, [diagnosticsData]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl border-green-500/30 bg-gradient-to-br from-card via-card to-green-500/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            System Health Diagnostics
          </CardTitle>
          <CardDescription>Run a full system check to verify connectivity to backend services, APIs, and AI models.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRunDiagnostics} disabled={isLoading} className="w-full sm:w-auto rounded-lg group">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Run Full System Diagnostics
          </Button>
        </CardContent>
      </Card>
      
      {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      {diagnosticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-md rounded-xl">
             <CardHeader>
                <CardTitle>Diagnostics Summary</CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
                <div className={`p-3 rounded-lg border ${diagnosticsData.overallStatus === 'ok' ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                    <p className="font-semibold text-sm">Overall Status</p>
                    <p className={`text-lg font-bold ${diagnosticsData.overallStatus === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{diagnosticsData.overallStatus.toUpperCase()}</p>
                </div>
                <p className="text-sm text-muted-foreground"><span className="font-bold">{statusCounts.ok} of {statusCounts.total}</span> checks passed.</p>
                <p className="text-xs text-muted-foreground"><Clock className="inline h-3 w-3 mr-1"/>Checked on: {new Date(diagnosticsData.timestamp).toLocaleString()}</p>
             </CardContent>
          </Card>
          
          <Card className="lg:col-span-2 shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Detailed Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(diagnosticsData.checks).map(([key, check]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
                    <div className="flex items-center gap-2">
                      {check.status === 'ok' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500"/>}
                      <span className="text-sm font-medium">{check.message}</span>
                    </div>
                     <span className={`text-xs font-bold px-2 py-1 rounded-full ${check.status === 'ok' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>{check.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
           
           <Card className="lg:col-span-3 shadow-md rounded-xl">
             <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary"/> AI-Powered Suggestions</CardTitle>
                <CardDescription>Based on the diagnostics report, here are some actionable suggestions.</CardDescription>
             </CardHeader>
             <CardContent>
                {isLoading && !aiSuggestions && <p className="text-muted-foreground text-sm">Waiting for full report to generate suggestions...</p>}
                {aiSuggestions && <MarkdownRenderer content={aiSuggestions} className="prose-sm p-4 bg-background/50 rounded-lg border"/>}
             </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}
