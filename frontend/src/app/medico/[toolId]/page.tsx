// src/app/medico/[toolId]/page.tsx
'use client';

import { useParams, useSearchParams, notFound } from 'next/navigation';
import { allMedicoToolsList } from '@/config/medico-tools-config';
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function MedicoToolPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const toolId = params.toolId as string;
    const topic = searchParams.get('topic');

    const tool = allMedicoToolsList.find(t => t.id === toolId);

    if (!tool || !tool.component) {
        // This will render the not-found.tsx file in the nearest parent segment
        notFound();
    }

    const ToolComponent = tool.component;

    return (
        <>
            <h1 className="text-3xl font-bold tracking-tight text-foreground my-4">{tool.title}</h1>
            <Card className="shadow-lg rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <tool.icon className="h-7 w-7 text-primary" />
                        {tool.title}
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ToolComponent initialTopic={topic} />
                </CardContent>
            </Card>
        </>
    );
}

export default function MedicoToolPage() {
    return (
        <Suspense fallback={
            <>
                <h1 className="text-3xl font-bold tracking-tight text-foreground my-4">Loading Tool...</h1>
                <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </>
        }>
            <MedicoToolPageContent />
        </Suspense>
    )
}
