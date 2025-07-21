
// src/app/medico/topics/page.tsx
'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HighYieldTopicPredictor } from '@/components/medico/high-yield-topic-predictor';

export default function HighYieldTopicPredictorPage() {
    return (
        <PageWrapper title="High-Yield Topic Predictor">
            <Card className="shadow-lg rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-2xl">High-Yield Topic Predictor</CardTitle>
                    <CardDescription>
                        Enter an exam type to get AI-predicted high-yield topics based on past trends and curriculum weightage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <HighYieldTopicPredictor />
                </CardContent>
            </Card>
        </PageWrapper>
    );
}
