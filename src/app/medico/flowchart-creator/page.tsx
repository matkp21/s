// src/app/medico/flowchart-creator/page.tsx
'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FlowchartCreator } from '@/components/medico/flowchart-creator';
import { Workflow } from 'lucide-react';

export default function FlowchartCreatorPage() {
    return (
        <PageWrapper title="Flowchart Creator">
            <Card className="shadow-lg rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Workflow className="h-7 w-7 text-primary" />
                        Flowchart Creator
                    </CardTitle>
                    <CardDescription>
                        Visually map out medical algorithms, diagnostic pathways, or management plans. Start from a template, from scratch, or let the AI generate one for you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FlowchartCreator />
                </CardContent>
            </Card>
        </PageWrapper>
    );
}
