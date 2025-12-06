// src/components/chat/mcq-result-card.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';
import type { MedicoMCQGeneratorOutput, MCQSchema } from '@/ai/agents/medico/MCQGeneratorAgent';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '../markdown/markdown-renderer';

interface MCQResultCardProps {
  result: MedicoMCQGeneratorOutput;
}

export function MCQResultCard({ result }: MCQResultCardProps) {
  return (
    <Card className="w-full bg-background/50 shadow-inner">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            Generated MCQs: {result.topicGenerated}
        </CardTitle>
        <CardDescription className="text-xs">
          Review the questions below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {result.mcqs.map((mcq: MCQSchema, index: number) => (
          <div key={index} className="p-3 border rounded-lg bg-muted/30">
            <p className="font-semibold mb-2">Q{index + 1}: {mcq.question}</p>
            <ul className="space-y-1.5 text-xs">
                {mcq.options.map((opt, optIndex) => (
                    <li key={optIndex} className={cn("p-2 border rounded-md transition-colors", opt.isCorrect ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-medium" : "border-border")}>
                    {String.fromCharCode(65 + optIndex)}. {opt.text}
                    </li>
                ))}
            </ul>
            {mcq.explanation && (
                <div className="text-xs mt-2 text-muted-foreground italic border-t pt-2">
                    <MarkdownRenderer content={`**Explanation:** ${mcq.explanation}`} />
                </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
