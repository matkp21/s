// src/app/patient-management/page.tsx
"use client";

import { PatientTabs } from '@/components/patient-management/patient-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PatientManagementPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground my-4">Patient Management Suite</h1>
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle>Patient Records & Tools</CardTitle>
          <CardDescription>Manage patient rounds, view timelines, and set reminders.</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientTabs />
        </CardContent>
      </Card>
    </>
  );
}
