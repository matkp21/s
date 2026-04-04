import { z } from 'genkit';

export const TaskItemSchema = z.object({
    id: z.string(),
    text: z.string(),
    category: z.enum(['Lab Review', 'Follow-up', 'Patient Alert', 'Schedule']),
    dueDate: z.string().optional(),
    priority: z.enum(['High', 'Medium', 'Low']).optional(),
    completed: z.boolean(),
});
export type TaskItem = z.infer<typeof TaskItemSchema>;

export const RecentActivityItemSchema = z.object({
    id: z.string(),
    text: z.string(),
    timestamp: z.string(),
});
export type RecentActivityItem = z.infer<typeof RecentActivityItemSchema>;

export const ProDashboardDataSchema = z.object({
    tasks: z.array(TaskItemSchema),
    recentActivity: z.array(RecentActivityItemSchema),
});
export type ProDashboardData = z.infer<typeof ProDashboardDataSchema>;

export const DischargeSummaryInputSchema = z.object({
  patientName: z.string().optional(),
  patientAge: z.string().optional(),
  admissionNumber: z.string().min(1),
  primaryDiagnosis: z.string().min(3),
  keySymptomsOrProcedure: z.string().optional(),
  additionalContext: z.string().optional()
});

export const DischargeSummaryOutputSchema = z.object({
  hospitalCourse: z.string(),
  dischargeMedications: z.array(z.string()),
  followUpPlans: z.array(z.string()),
  patientEducation: z.array(z.string()),
  redFlags: z.array(z.string()),
  notesForDoctor: z.string().optional()
});
