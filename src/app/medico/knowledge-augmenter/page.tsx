// src/app/medico/knowledge-augmenter/page.tsx
'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import KnowledgeAugmenter from '@/components/medico/knowledge-augmenter';
import { BrainCircuit, Sparkles } from 'lucide-react';

export default function KnowledgeAugmenterPage() {
    return (
        <PageWrapper title="AI Knowledge Augmenter">
            <Card className="shadow-lg rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Sparkles className="h-7 w-7 text-primary" />
                        Knowledge Augmenter
                    </CardTitle>
                    <CardDescription>
                        Upload your study notes (PDF, image, or text), ask a question, and let the AI validate and augment your knowledge with critical, textbook-level information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <KnowledgeAugmenter />
                </CardContent>
            </Card>
        </PageWrapper>
    );
}
