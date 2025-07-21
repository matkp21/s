// src/app/patient-management/page.tsx
"use client";

import { PatientTabs } from '@/components/patient-management/patient-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function PatientManagementPage() {
  return (
    <PageWrapper title="Patient Management Suite">
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle>Patient Records & Tools</CardTitle>
          <CardDescription>Manage patient rounds, view timelines, and set reminders.</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientTabs />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
